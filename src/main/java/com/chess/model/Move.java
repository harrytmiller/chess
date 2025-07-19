package com.chess.model;

import java.time.LocalDateTime;

public class Move {
    private Long id;
    private int fromRow;
    private int fromCol;
    private int toRow;
    private int toCol;
    private Piece.PieceType pieceType;
    private Piece.Color pieceColor;
    private LocalDateTime timestamp;
    private int moveNumber;
    
    public Move() {
        this.timestamp = LocalDateTime.now();
    }
    
    public Move(int fromRow, int fromCol, int toRow, int toCol, 
                Piece.PieceType pieceType, Piece.Color pieceColor) {
        this();
        this.fromRow = fromRow;
        this.fromCol = fromCol;
        this.toRow = toRow;
        this.toCol = toCol;
        this.pieceType = pieceType;
        this.pieceColor = pieceColor;
    }
    
    public Long getId() { return id; }
    public int getFromRow() { return fromRow; }
    public int getFromCol() { return fromCol; }
    public int getToRow() { return toRow; }
    public int getToCol() { return toCol; }
    public Piece.PieceType getPieceType() { return pieceType; }
    public Piece.Color getPieceColor() { return pieceColor; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public int getMoveNumber() { return moveNumber; }
    public void setMoveNumber(int moveNumber) { this.moveNumber = moveNumber; }
}
