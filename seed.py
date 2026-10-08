from app import app
from models import db, User, Trek, Booking
from werkzeug.security import generate_password_hash
from datetime import date

def seed_database():
    with app.app_context():
        print("Dropping existing tables...")
        db.drop_all()

        print("Creating tables...")
        db.create_all()
        print("Tables created: user, trek, booking")

        print("Creating admin user...")
        admin = User(
            name='Admin',
            email='admin@trekkingapp.com',
            password_hash=generate_password_hash('admin123'),
            phone='9000000000',
            role='admin',
            status='active'
        )
        db.session.add(admin)

        print("Creating staff users...")
        staff1 = User(
            name='Rahul Sharma',
            email='rahul@trekkingapp.com',
            password_hash=generate_password_hash('staff123'),
            phone='9111111111',
            role='staff',
            status='active'
        )
        staff2 = User(
            name='Priya Patel',
            email='priya@trekkingapp.com',
            password_hash=generate_password_hash('staff123'),
            phone='9222222222',
            role='staff',
            status='active'
        )
        db.session.add_all([staff1, staff2])

        print("Creating trekker users...")
        users = [
            User(name='Arjun Mehta', email='arjun@mail.com',
                 password_hash=generate_password_hash('user123'),
                 phone='9876543210', role='user', status='active'),
            User(name='Sneha Reddy', email='sneha@mail.com',
                 password_hash=generate_password_hash('user123'),
                 phone='9876543211', role='user', status='active'),
            User(name='Vikram Singh', email='vikram@mail.com',
                 password_hash=generate_password_hash('user123'),
                 phone='9876543212', role='user', status='active'),
        ]
        db.session.add_all(users)
        db.session.commit()

        print("Creating sample treks...")
        treks = [
            Trek(
                name='Valley of Flowers',
                location='Uttarakhand',
                difficulty='Easy',
                duration=5,
                max_slots=20,
                available_slots=14,
                price=8500,
                start_date=date(2026, 8, 15),
                end_date=date(2026, 8, 19),
                max_altitude='3658m',
                base_camp='Govindghat',
                description='A beautiful trek through meadows of endemic alpine flowers in the Himalayas.',
                staff_id=staff1.id,
                status='Open'
            ),
            Trek(
                name='Roopkund Trek',
                location='Uttarakhand',
                difficulty='Moderate',
                duration=7,
                max_slots=15,
                available_slots=3,
                price=12000,
                start_date=date(2026, 7, 1),
                end_date=date(2026, 7, 7),
                max_altitude='5029m',
                base_camp='Lohajung',
                description='The mysterious skeleton lake trek at 16,500 ft in the Himalayas.',
                staff_id=staff2.id,
                status='Open'
            ),
            Trek(
                name='Kudremukh Trek',
                location='Karnataka',
                difficulty='Easy',
                duration=2,
                max_slots=30,
                available_slots=22,
                price=3500,
                start_date=date(2026, 10, 5),
                end_date=date(2026, 10, 6),
                max_altitude='1894m',
                base_camp='Kalsa',
                description='A scenic trek through the Western Ghats with rolling green hills.',
                staff_id=staff2.id,
                status='Open'
            ),
            Trek(
                name='Chadar Trek',
                location='Ladakh',
                difficulty='Hard',
                duration=9,
                max_slots=15,
                available_slots=2,
                price=25000,
                start_date=date(2027, 1, 10),
                end_date=date(2027, 1, 18),
                max_altitude='3390m',
                base_camp='Leh',
                description='Walk on the frozen Zanskar River in extreme winter conditions.',
                staff_id=staff1.id,
                status='Closed'
            ),
        ]
        db.session.add_all(treks)
        db.session.commit()

        print("Creating sample bookings...")
        bookings = [
            Booking(user_id=4, trek_id=1, booking_status='Booked', payment_status='Paid'),
            Booking(user_id=4, trek_id=3, booking_status='Booked', payment_status='Paid'),
            Booking(user_id=5, trek_id=1, booking_status='Booked', payment_status='Paid'),
            Booking(user_id=5, trek_id=2, booking_status='Cancelled', payment_status='Refunded'),
            Booking(user_id=6, trek_id=3, booking_status='Booked', payment_status='Paid'),
        ]
        db.session.add_all(bookings)
        db.session.commit()

        print("Database generated.")

if __name__ == '__main__':
    seed_database()