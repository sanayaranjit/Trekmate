from celery import Celery
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import csv
import json
import os
from datetime import datetime, timedelta

celery_app = Celery(
    'trekmate',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1'
)

celery_app.conf.update(
    timezone='Asia/Kolkata',
    enable_utc=True,
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    beat_schedule={
        'daily-trek-reminder': {
            'task': 'tasks.send_daily_reminders',
            'schedule': {'type': 'crontab', 'minute': 0, 'hour': 8, 'day_of_month': '*', 'month_of_year': '*', 'day_of_week': '*'},
            'args': ()
        },
        'monthly-activity-report': {
            'task': 'tasks.send_monthly_report',
            'schedule': {'type': 'crontab', 'minute': 0, 'hour': 9, 'day_of_month': 1, 'month_of_year': '*', 'day_of_week': '*'},
            'args': ()
        }
    }
)

@celery_app.task(name='tasks.send_daily_reminders')
def send_daily_reminders():
    import os
    from app import app
    from models import db, User, Trek, Booking

    print("Daily reminder task started")

    with app.app_context():
        three_days_from_now = datetime.now().date() + timedelta(days=3)
        upcoming_bookings = Booking.query.filter(
            Booking.booking_status == 'Booked'
        ).all()

        reminders_sent = 0

        for booking in upcoming_bookings:
            trek = Trek.query.get(booking.trek_id)
            if not trek:
                continue

            if trek.start_date and trek.start_date <= three_days_from_now:
                user = User.query.get(booking.user_id)
                if not user or not user.email:
                    continue

                message = (
                    "Hello " + user.name + ",\n\n"
                    "This is a reminder that your trek '" + trek.name + "' is starting on " + str(trek.start_date) + ".\n\n"
                    "Location: " + trek.location + "\n"
                    "Duration: " + str(trek.duration) + " days\n"
                    "Please be prepared and carry necessary gear.\n\n"
                    "Best regards,\nTrekMate Team"
                )

                try:
                    smtp_server = smtplib.SMTP('smtp.gmail.com', 587)
                    smtp_server.starttls()
                    smtp_server.login(os.environ.get('MAIL_USERNAME', 'your-email@gmail.com'), os.environ.get('MAIL_PASSWORD', 'your-app-password'))

                    msg = MIMEText(message)
                    msg['Subject'] = 'Trek Reminder: ' + trek.name + ' starting on ' + str(trek.start_date)
                    msg['From'] = os.environ.get('MAIL_USERNAME', 'your-email@gmail.com')
                    msg['To'] = user.email
                    smtp_server.send_message(msg)
                    smtp_server.quit()
                    reminders_sent += 1
                except Exception as e:
                    print("Email failed for user " + str(user.id) + ": " + str(e))

        webhook_url = os.environ.get('GCHAT_WEBHOOK_URL', '')
        if webhook_url:
            try:
                for booking in upcoming_bookings[:5]:
                    trek = Trek.query.get(booking.trek_id)
                    if trek:
                        webhook_message = {
                            "text": "Trek Reminder: " + trek.name + " on " + str(trek.start_date) + " | Slots: " + str(trek.available_slots)
                        }
                        requests.post(webhook_url, json=webhook_message, timeout=5)
            except Exception as e:
                print("Webhook failed: " + str(e))

        print("Daily reminders sent: " + str(reminders_sent))

    return {"status": "completed", "reminders_sent": reminders_sent}

@celery_app.task(name='tasks.send_monthly_report')
def send_monthly_report():
    import os
    from app import app
    from models import db, User, Trek, Booking

    print("Monthly report task started")

    with app.app_context():
        now = datetime.now()
        first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month = first_of_month - timedelta(days=1)

        total_treks = Trek.query.count()
        completed_treks = Trek.query.filter(Trek.status == 'Completed').count()
        total_bookings = Booking.query.count()
        completed_bookings = Booking.query.filter(Booking.booking_status == 'Completed').count()
        total_users = User.query.filter_by(role='user').count()
        active_users = User.query.filter_by(role='user', status='active').count()

        trek_booking_counts = db.session.query(
            Booking.trek_id, db.func.count(Booking.id).label('booking_count')
        ).filter(
            Booking.booking_status != 'Cancelled'
        ).group_by(Booking.trek_id).order_by(db.desc('booking_count')).limit(5).all()

        popular_treks = []
        for row in trek_booking_counts:
            trek = Trek.query.get(row.trek_id)
            if trek:
                popular_treks.append(trek.name + " (" + str(row.booking_count) + " bookings)")

        html_content = """
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #2c2c2c;">
            <h1 style="color: #1b4332;">TrekMate Monthly Report</h1>
            <p>Period: """ + last_month.strftime('%B %Y') + """</p>
            <hr>
            <h2>Summary</h2>
            <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
                <tr style="background: #1b4332; color: white;">
                    <th style="padding: 10px; text-align: left;">Metric</th>
                    <th style="padding: 10px; text-align: left;">Value</th>
                </tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Total Treks</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">""" + str(total_treks) + """</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Completed Treks</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">""" + str(completed_treks) + """</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Total Bookings</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">""" + str(total_bookings) + """</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Completed Bookings</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">""" + str(completed_bookings) + """</td></tr>
                <tr><td style="padding: 8px;">Total Users</td><td style="padding: 8px;">""" + str(total_users) + """ (Active: """ + str(active_users) + """)</td></tr>
            </table>
            <h2>Popular Treks</h2>
            <ol>
                <li>""" + ("</li><li>".join(popular_treks) if popular_treks else "No data") + """</li>
            </ol>
            <p style="color: #6c757d; font-size: 12px;">Generated on """ + now.strftime('%Y-%m-%d %H:%M') + """ by TrekMate</p>
        </body>
        </html>
        """

        try:
            admin = User.query.filter_by(role='admin').first()
            if admin and admin.email:
                smtp_server = smtplib.SMTP('smtp.gmail.com', 587)
                smtp_server.starttls()
                smtp_server.login(os.environ.get('MAIL_USERNAME', 'your-email@gmail.com'), os.environ.get('MAIL_PASSWORD', 'your-app-password'))

                msg = MIMEMultipart('alternative')
                msg['Subject'] = 'TrekMate Monthly Report - ' + last_month.strftime('%B %Y')
                msg['From'] = os.environ.get('MAIL_USERNAME', 'your-email@gmail.com')
                msg['To'] = admin.email

                msg.attach(MIMEText(html_content, 'html'))
                smtp_server.send_message(msg)
                smtp_server.quit()
                print("Monthly report sent to " + admin.email)
        except Exception as e:
            print("Monthly report email failed: " + str(e))

    return {"status": "completed", "month": last_month.strftime('%B %Y')}

@celery_app.task(name='tasks.export_booking_csv')
def export_booking_csv(user_id):
    import os
    from app import app
    from models import db, User, Booking, Trek

    print("CSV export started for user " + str(user_id))

    with app.app_context():
        user = User.query.get(user_id)
        if not user:
            return {"status": "error", "message": "User not found"}

        bookings = Booking.query.filter_by(user_id=user_id).all()
        os.makedirs('static/exports', exist_ok=True)
        filepath = 'static/exports/user_' + str(user_id) + '_history.csv'
        csv_content = 'Booking ID,Trek Name,Location,Booking Status,Payment Status,Booking Date\n'

        for b in bookings:
            trek = Trek.query.get(b.trek_id)
            trek_name = trek.name if trek else 'Unknown'
            trek_location = trek.location if trek else 'Unknown'
            booking_date = b.booking_date.strftime('%Y-%m-%d') if b.booking_date else 'N/A'
            csv_content += str(b.id) + ',"' + trek_name + '","' + trek_location + '","' + b.booking_status + '","' + b.payment_status + '","' + booking_date + '"\n'

        with open(filepath, 'w', newline='') as f:
            f.write(csv_content)

    print("CSV saved to " + filepath)

    return {
        "status": "completed",
        "user_id": user_id,
        "file": filepath,
        "message": "CSV exported successfully"
    }