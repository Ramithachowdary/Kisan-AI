@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):

    hashed = hash_token(refresh_token)

    token_entry = db.query(RefreshToken).filter(
        RefreshToken.token_hash == hashed,
        RefreshToken.revoked == False
    ).first()

    if not token_entry:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if token_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired")

    new_access = create_access_token({"sub": str(token_entry.user_id)})

    return {"access_token": new_access}
