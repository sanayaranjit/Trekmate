from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(15))
    role = db.Column(db.String(20), default='user', nullable=False)
    status = db.Column(db.String(20), default='active', nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    bookings = db.relationship('Booking', backref='user', lazy='dynamic')
    managed_treks = db.relationship('Trek', backref='staff_member', lazy='dynamic', foreign_keys='Trek.staff_id')

    def convert_to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'status': self.status,
            'created_at': str(self.created_at) if self.created_at else None
        }

class Trek(db.Model):
    __tablename__ = 'trek'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    max_slots = db.Column(db.Integer, nullable=False, default=20)
    available_slots = db.Column(db.Integer, nullable=False, default=20)
    price = db.Column(db.Integer, nullable=False, default=0)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    max_altitude = db.Column(db.String(20))
    base_camp = db.Column(db.String(100))
    description = db.Column(db.Text)
    staff_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'))
    status = db.Column(db.String(20), default='Pending', nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    bookings = db.relationship('Booking', backref='trek', lazy='dynamic', cascade='all, delete-orphan')

    def convert_to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'difficulty': self.difficulty,
            'duration': self.duration,
            'max_slots': self.max_slots,
            'available_slots': self.available_slots,
            'price': self.price,
            'start_date': str(self.start_date) if self.start_date else None,
            'end_date': str(self.end_date) if self.end_date else None,
            'max_altitude': self.max_altitude,
            'base_camp': self.base_camp,
            'description': self.description,
            'staff_id': self.staff_id,
            'staff_name': self.staff_member.name if self.staff_member else 'Unassigned',
            'status': self.status,
            'created_at': str(self.created_at) if self.created_at else None
        }

class Booking(db.Model):
    __tablename__ = 'booking'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    trek_id = db.Column(db.Integer, db.ForeignKey('trek.id', ondelete='CASCADE'), nullable=False)
    booking_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    booking_status = db.Column(db.String(20), default='Booked', nullable=False)
    payment_status = db.Column(db.String(20), default='Pending', nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def convert_to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'trek_id': self.trek_id,
            'user_name': self.user.name if self.user else 'Unknown',
            'trek_name': self.trek.name if self.trek else 'Unknown',
            'trek_location': self.trek.location if self.trek else 'Unknown',
            'booking_date': str(self.booking_date) if self.booking_date else None,
            'booking_status': self.booking_status,
            'payment_status': self.payment_status,
            'created_at': str(self.created_at) if self.created_at else None
        }