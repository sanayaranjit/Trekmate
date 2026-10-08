# Trekking_management_system
This is a dummy project  to manage trekking activities involving trek organizers, staff, and participants.

## How to Run

### Prerequisites
- Python 3.8+
- Redis server running
- pip install -r requirements.txt

### Setup
1. Create virtual environment: python -m venv venv
2. Activate: source venv/bin/activate (Linux/Mac) or venv\Scripts\activate (Windows)
3. Install dependencies: pip install -r requirements.txt
4. Create database: python seed.py
5. Start Redis: redis-server (preferrably via wsl)
6. Start Flask: python app.py
7. Open: http://localhost:5000


## Tech Stack
- Flask, SQLAlchemy, Redis, Celery, Vue 3, Bootstrap 5, Chart.js