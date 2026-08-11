from sqlalchemy.orm import Session
from app.database.connection import engine, SessionLocal
from app.database.base import Base
from app.models.user import User
from app.models.tier import Tier
from app.auth.password import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if admin already exists
    if db.query(User).filter(User.email == "admin@example.com").first():
        print("Database already seeded.")
        db.close()
        return

    # Seed tiers
    tiers = [
        {"name": "TIER_1", "level": 1},
        {"name": "TIER_2", "level": 2},
        {"name": "TIER_3", "level": 3},
    ]
    for t in tiers:
        if not db.query(Tier).filter(Tier.name == t["name"]).first():
            db.add(Tier(name=t["name"], level=t["level"]))
    db.commit()

    users = [
        {"name": "Admin User", "email": "admin@example.com", "password": "password123", "role": "ADMIN"},
        {"name": "Tier 1 User", "email": "tier1@example.com", "password": "password123", "role": "TIER_1"},
        {"name": "Tier 2 User", "email": "tier2@example.com", "password": "password123", "role": "TIER_2"},
        {"name": "Tier 3 User", "email": "tier3@example.com", "password": "password123", "role": "TIER_3"},
    ]

    for u in users:
        db_user = User(
            name=u["name"],
            email=u["email"],
            password_hash=get_password_hash(u["password"]),
            role=u["role"],
        )
        db.add(db_user)
        
    db.commit()
    db.close()
    print("Database successfully seeded.")

if __name__ == "__main__":
    seed_db()
