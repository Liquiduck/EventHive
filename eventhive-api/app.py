import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from services import fetch_ticketmaster_events

# 1. Load environment variables
load_dotenv()

app = Flask(__name__)

# 2. Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 3. Initialize Extensions
db = SQLAlchemy(app)
CORS(app)
jwt = JWTManager(app)

# 4. Database Model: User
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'
    
class SavedEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # We save specific details so we don't have to query Ticketmaster again for the profile page
    tm_id = db.Column(db.String(50), nullable=False) # Ticketmaster ID
    name = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(50))
    venue = db.Column(db.String(200))
    image = db.Column(db.String(500))
    url = db.Column(db.String(500))

    def __repr__(self):
        return f'<SavedEvent {self.name}>'

# 5. Routes
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the EventHive API!"})

# Register Route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"msg": "Missing username, email, or password"}), 400

    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        return jsonify({"msg": "User already exists"}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

# Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(logged_in_as=user.username), 200

@app.route('/events', methods=['GET'])
def get_events():
    city = request.args.get('city', 'Istanbul') 
    
    events = fetch_ticketmaster_events(city)
    
    if not events:
        return jsonify({"msg": "No events found or API error"}), 404
        
    return jsonify(events), 200

@app.route('/save_event', methods=['POST'])
@jwt_required()
def save_event():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Check if already saved to prevent duplicates
    existing = SavedEvent.query.filter_by(user_id=current_user_id, tm_id=data.get('id')).first()
    if existing:
        return jsonify({"msg": "Event already saved"}), 409

    new_event = SavedEvent(
        user_id=current_user_id,
        tm_id=data.get('id'),
        name=data.get('name'),
        date=data.get('date'),
        venue=data.get('venue'),
        image=data.get('image'),
        url=data.get('url')
    )

    db.session.add(new_event)
    db.session.commit()
    
    return jsonify({"msg": "Event saved successfully!"}), 201

@app.route('/my_events', methods=['GET'])
@jwt_required()
def get_my_events():
    current_user_id = get_jwt_identity()
    saved_events = SavedEvent.query.filter_by(user_id=current_user_id).all()
    
    results = []
    for event in saved_events:
        results.append({
            "id": event.id, # Our DB ID
            "tm_id": event.tm_id,
            "name": event.name,
            "date": event.date,
            "venue": event.venue,
            "image": event.image,
            "url": event.url
        })
    
    return jsonify(results), 200

@app.route('/delete_event/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    current_user_id = get_jwt_identity()
    event = SavedEvent.query.filter_by(id=event_id, user_id=current_user_id).first()

    if not event:
        return jsonify({"msg": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({"msg": "Event removed"}), 200

# 6. Run the App
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)