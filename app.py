from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Trek, Booking
from cache_helper import get_cached, set_cached, delete_cached
from tasks import export_booking_csv
from datetime import datetime

app = Flask(__name__, template_folder='templates', static_folder='static')

app.config['SECRET_KEY'] = 'trekking-app-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///trekking.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if not data.get('phone') or len(data.get('phone')) != 10:
        return jsonify({'error': 'Valid 10-digit phone number required'}), 400

    if len(data.get('password')) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    existing = User.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        phone=data['phone'],
        role='user',
        status='active'
    )

    db.session.add(new_user)
    db.session.commit()

    session['user_id'] = new_user.id
    session['user_role'] = new_user.role
    session['user_name'] = new_user.name

    return jsonify({
        'message': 'Registration successful',
        'user': new_user.convert_to_dict()
    }), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    if user.status == 'blacklisted':
        return jsonify({'error': 'Your account has been blacklisted'}), 403

    if user.status == 'deactivated':
        return jsonify({'error': 'Your account has been deactivated'}), 403

    session['user_id'] = user.id
    session['user_role'] = user.role
    session['user_name'] = user.name

    return jsonify({
        'message': 'Login successful',
        'user': user.convert_to_dict()
    })

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/check-session', methods=['GET'])
def check_session():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'logged_in': True,
                'user': user.convert_to_dict()
            })
    return jsonify({'logged_in': False})

def get_current_user_info():
    if 'user_id' not in session:
        return None
    return User.query.get(session['user_id'])

@app.route('/treks', methods=['GET'])
def get_treks():
    cached = get_cached('treks:all')
    if cached is not None:
        return jsonify(cached)

    treks = Trek.query.all()
    result = [t.convert_to_dict() for t in treks]
    set_cached('treks:all', result, expire_seconds=300)

    return jsonify(result)

@app.route('/treks', methods=['POST'])
def create_trek():
    user = get_current_user_info()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    required = ['name', 'location', 'difficulty', 'duration', 'max_slots', 'start_date', 'end_date', 'price']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    trek = Trek(
        name=data['name'],
        location=data['location'],
        difficulty=data['difficulty'],
        duration=int(data['duration']),
        max_slots=int(data['max_slots']),
        available_slots=int(data['max_slots']),
        price=int(data['price']),
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
        max_altitude=data.get('max_altitude', ''),
        base_camp=data.get('base_camp', ''),
        description=data.get('description', ''),
        staff_id=data.get('staff_id'),
        status=data.get('status', 'Pending')
    )

    db.session.add(trek)
    db.session.commit()
    delete_cached('treks:all')

    return jsonify({'message': 'Trek created', 'trek': trek.convert_to_dict()}), 201

@app.route('/treks/<int:trek_id>', methods=['PUT'])
def update_trek(trek_id):
    user = get_current_user_info()
    if not user:
        return jsonify({'error': 'Login required'}), 401

    trek = Trek.query.get(trek_id)
    if not trek:
        return jsonify({'error': 'Trek not found'}), 404

    if user.role != 'admin' and trek.staff_id != user.id:
        return jsonify({'error': 'Only admin or assigned staff can update this trek'}), 403

    data = request.get_json()

    if data.get('name'):
        trek.name = data['name']
    if data.get('location'):
        trek.location = data['location']
    if data.get('difficulty'):
        trek.difficulty = data['difficulty']
    if data.get('duration'):
        trek.duration = int(data['duration'])
    if data.get('max_slots'):
        trek.max_slots = int(data['max_slots'])
    if data.get('available_slots') is not None:
        trek.available_slots = int(data['available_slots'])
    if data.get('price'):
        trek.price = int(data['price'])
    if data.get('start_date'):
        trek.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    if data.get('end_date'):
        trek.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    if data.get('max_altitude') is not None:
        trek.max_altitude = data['max_altitude']
    if data.get('base_camp') is not None:
        trek.base_camp = data['base_camp']
    if data.get('description') is not None:
        trek.description = data['description']
    if data.get('staff_id') is not None:
        trek.staff_id = data['staff_id'] if data['staff_id'] else None
    if data.get('status'):
        trek.status = data['status']

    db.session.commit()

    if data.get('status') == 'Completed':
            Booking.query.filter(
                Booking.trek_id == trek_id,
                Booking.booking_status == 'Booked'
            ).update({'booking_status': 'Completed'})
            db.session.commit()
            
    delete_cached('treks:all')

    return jsonify({'message': 'Trek updated', 'trek': trek.convert_to_dict()})

@app.route('/treks/<int:trek_id>', methods=['DELETE'])
def delete_trek(trek_id):
    user = get_current_user_info()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    trek = Trek.query.get(trek_id)
    if not trek:
        return jsonify({'error': 'Trek not found'}), 404

    db.session.delete(trek)
    db.session.commit()
    delete_cached('treks:all')

    return jsonify({'message': 'Trek deleted'})

@app.route('/bookings', methods=['GET'])
def get_bookings():
    user = get_current_user_info()
    if not user:
        return jsonify({'error': 'Login required'}), 401

    if user.role == 'admin':
        bookings = Booking.query.all()
    elif user.role == 'staff':
        my_trek_ids = [t.id for t in user.managed_treks.all()]
        bookings = Booking.query.filter(Booking.trek_id.in_(my_trek_ids)).all()
    else:
        bookings = Booking.query.filter_by(user_id=user.id).all()

    return jsonify([b.convert_to_dict() for b in bookings])

@app.route('/bookings', methods=['POST'])
def create_booking():
    user = get_current_user_info()
    if not user or user.role != 'user':
        return jsonify({'error': 'Only trekkers can book'}), 403

    data = request.get_json()
    trek_id = data.get('trek_id')

    if not trek_id:
        return jsonify({'error': 'trek_id is required'}), 400

    trek = Trek.query.get(trek_id)
    if not trek:
        return jsonify({'error': 'Trek not found'}), 404

    if trek.status != 'Open':
        return jsonify({'error': 'This trek is not open for booking'}), 400

    if trek.available_slots <= 0:
        return jsonify({'error': 'No slots available'}), 400

    existing = Booking.query.filter_by(
        user_id=user.id,
        trek_id=trek_id,
        booking_status='Booked'
    ).first()
    if existing:
        return jsonify({'error': 'You have already booked this trek'}), 409

    booking = Booking(
        user_id=user.id,
        trek_id=trek_id,
        booking_status='Booked',
        payment_status='Paid'
    )

    trek.available_slots = trek.available_slots - 1
    db.session.add(booking)
    db.session.commit()
    delete_cached('treks:all')

    return jsonify({'message': 'Booking successful', 'booking': booking.convert_to_dict()}), 201

@app.route('/bookings/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    user = get_current_user_info()
    if not user:
        return jsonify({'error': 'Login required'}), 401

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    if user.role != 'admin' and booking.user_id != user.id:
        return jsonify({'error': 'Not authorized to cancel this booking'}), 403

    if booking.booking_status != 'Booked':
        return jsonify({'error': 'Only active bookings can be cancelled'}), 400

    booking.booking_status = 'Cancelled'
    booking.payment_status = 'Refunded'

    trek = Trek.query.get(booking.trek_id)
    if trek:
        trek.available_slots = trek.available_slots + 1

    db.session.commit()
    delete_cached('treks:all')

    return jsonify({'message': 'Booking cancelled', 'booking': booking.convert_to_dict()})

@app.route('/users', methods=['GET'])
def get_users():
    user = get_current_user_info()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    return jsonify([u.convert_to_dict() for u in users])

@app.route('/users/<int:user_id>/status', methods=['PUT'])
def update_user_status(user_id):
    user = get_current_user_info()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    new_status = data.get('status')

    if new_status not in ['active', 'deactivated', 'blacklisted']:
        return jsonify({'error': 'Invalid status'}), 400

    target_user.status = new_status
    db.session.commit()

    return jsonify({'message': 'User status updated', 'user': target_user.convert_to_dict()})

@app.route('/users/<int:user_id>/profile', methods=['PUT'])
def update_profile(user_id):
    user = get_current_user_info()
    if not user:
        return jsonify({'error': 'Login required'}), 401

    if user.role != 'admin' and user.id != user_id:
        return jsonify({'error': 'Not authorized'}), 403

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    if data.get('name'):
        target_user.name = data['name']
    if data.get('phone'):
        if len(data['phone']) != 10:
            return jsonify({'error': 'Valid 10-digit phone required'}), 400
        target_user.phone = data['phone']

    db.session.commit()

    if user.id == user_id:
        session['user_name'] = target_user.name

    return jsonify({'message': 'Profile updated', 'user': target_user.convert_to_dict()})

@app.route('/staff', methods=['GET'])
def get_staff():
    user = get_current_user_info()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    staff = User.query.filter_by(role='staff').all()
    result = []
    for s in staff:
        staff_dict = s.convert_to_dict()
        staff_dict['assigned_treks'] = [t.id for t in s.managed_treks.all()]
        result.append(staff_dict)
    return jsonify(result)

@app.route('/staff', methods=['POST'])
def create_staff():
    user = get_current_user_info()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()

    if not data.get('name') or not data.get('email') or not data.get('phone'):
        return jsonify({'error': 'Name, email, and phone are required'}), 400

    existing = User.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    staff = User(
        name=data['name'],
        email=data['email'],
        password_hash=generate_password_hash('staff123'),
        phone=data['phone'],
        role='staff',
        status='active'
    )

    db.session.add(staff)
    db.session.commit()

    return jsonify({'message': 'Staff member added', 'staff': staff.convert_to_dict()}), 201

@app.route('/staff/<int:staff_id>/assign-trek', methods=['PUT'])
def assign_trek_to_staff(staff_id):
    user = get_current_user_info()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    staff_user = User.query.get(staff_id)
    if not staff_user or staff_user.role != 'staff':
        return jsonify({'error': 'Staff not found'}), 404

    data = request.get_json()
    trek_id = data.get('trek_id')

    if not trek_id:
        return jsonify({'error': 'trek_id is required'}), 400

    trek = Trek.query.get(trek_id)
    if not trek:
        return jsonify({'error': 'Trek not found'}), 404

    if trek.staff_id == staff_id:
        return jsonify({'error': 'Trek already assigned to this staff'}), 400

    trek.staff_id = staff_id
    db.session.commit()
    delete_cached('treks:all')

    return jsonify({'message': 'Trek assigned to staff', 'trek': trek.convert_to_dict()})

@app.route('/staff/<int:staff_id>/status', methods=['PUT'])
def update_staff_status(staff_id):
    user = get_current_user_info()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    staff_user = User.query.get(staff_id)
    if not staff_user:
        return jsonify({'error': 'Staff not found'}), 404

    data = request.get_json()
    new_status = data.get('status')

    if new_status not in ['active', 'deactivated']:
        return jsonify({'error': 'Invalid status'}), 400

    staff_user.status = new_status
    db.session.commit()

    return jsonify({'message': 'Staff status updated', 'staff': staff_user.convert_to_dict()})

@app.route('/stats/admin', methods=['GET'])
def admin_stats():
    user = get_current_user_info()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    return jsonify({
        'total_treks': Trek.query.count(),
        'total_users': User.query.filter_by(role='user').count(),
        'total_staff': User.query.filter_by(role='staff').count(),
        'total_bookings': Booking.query.count(),
        'open_treks': Trek.query.filter_by(status='Open').count(),
        'completed_treks': Trek.query.filter_by(status='Completed').count(),
        'active_bookings': Booking.query.filter_by(booking_status='Booked').count(),
        'completed_bookings': Booking.query.filter_by(booking_status='Completed').count()
    })

@app.route('/stats/staff', methods=['GET'])
def staff_stats():
    user = get_current_user_info()
    if not user or user.role != 'staff':
        return jsonify({'error': 'Staff access required'}), 403

    my_treks = user.managed_treks.all()
    my_trek_ids = [t.id for t in my_treks]

    total_participants = Booking.query.filter(
        Booking.trek_id.in_(my_trek_ids),
        Booking.booking_status == 'Booked'
    ).count()

    return jsonify({
        'assigned_treks': len(my_treks),
        'total_participants': total_participants,
        'open_treks': len([t for t in my_treks if t.status == 'Open'])
    })

@app.route('/stats/user', methods=['GET'])
def user_stats():
    user = get_current_user_info()
    if not user or user.role != 'user':
        return jsonify({'error': 'User access required'}), 403

    my_bookings = Booking.query.filter_by(user_id=user.id).all()

    return jsonify({
        'booked': len([b for b in my_bookings if b.booking_status == 'Booked']),
        'completed': len([b for b in my_bookings if b.booking_status == 'Completed']),
        'cancelled': len([b for b in my_bookings if b.booking_status == 'Cancelled']),
        'total': len(my_bookings)
    })

@app.route('/export-csv', methods=['POST'])
def trigger_csv_export():
    user = get_current_user_info()
    if not user:
        return jsonify({'error': 'Login required'}), 401

    task = export_booking_csv.delay(user.id)

    return jsonify({
        'message': 'CSV export started. You will be notified when it is ready.',
        'task_id': task.id
    })


@app.route('/task-status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    user = get_current_user_info()
    if not user:
        return jsonify({'error': 'Login required'}), 401

    from tasks import celery_app
    result = celery_app.AsyncResult(task_id)
    
    if result.ready():
        return jsonify({'status': 'completed', 'result': result.result})
    else:
        return jsonify({'status': 'pending'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)