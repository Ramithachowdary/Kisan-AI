from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import datetime

Base = declarative_base()
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    phone = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=True, default=None)
    state = Column(String, nullable=True, default=None)
    district = Column(String, nullable=True, default=None)
    village = Column(String, nullable=True, default=None)
    land_size = Column(Float, nullable=True, default=None)
    crops = Column(String, nullable=True, default=None)
    language = Column(String, nullable=True, default="English")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CropDiagnosis(Base):
    __tablename__ = 'crop_diagnosis'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    crop = Column(String)
    photo = Column(String)
    result = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship('User')


class MarketPrice(Base):
    __tablename__ = 'market_prices'
    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String)
    mandi = Column(String)
    price = Column(Float)
    trend = Column(String)


class Scheme(Base):
    __tablename__ = 'schemes'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    eligibility_criteria = Column(Text)
    docs_needed = Column(Text)
    benefits = Column(String)
    deadline = Column(DateTime)


class SchemeApplication(Base):
    __tablename__ = 'scheme_applications'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    scheme_id = Column(Integer, ForeignKey('schemes.id'))
    status = Column(String)
    user = relationship('User')
    scheme = relationship('Scheme')


class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    type = Column(String)
    content = Column(Text)
    read_flag = Column(Boolean, default=False)
    user = relationship('User')


class HelpHistory(Base):
    __tablename__ = 'help_history'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    query = Column(Text)
    result = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship('User')


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    token_hash = Column(Text, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    user = relationship("User")


class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String, nullable=False, default="/kg")
    location = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    emoji = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User')

