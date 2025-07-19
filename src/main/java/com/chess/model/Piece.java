package com.chess.model;

public class Piece {
    private Long id;
    private PieceType type;
    private Color color;
    private int row;
    private int col;
    private boolean hasMoved = false;
    
    public Piece() {}
    
    public Piece(PieceType type, Color color, int row, int col) {
        this.type = type;
        this.color = color;
        this.row = row;
        this.col = col;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public PieceType getType() { return type; }
    public void setType(PieceType type) { this.type = type; }
    
    public Color getColor() { return color; }
    public void setColor(Color color) { this.color = color; }
    
    public int getRow() { return row; }
    public void setRow(int row) { this.row = row; }
    
    public int getCol() { return col; }
    public void setCol(int col) { this.col = col; }
    
    public boolean isHasMoved() { return hasMoved; }
    public void setHasMoved(boolean hasMoved) { this.hasMoved = hasMoved; }
    
    public enum PieceType {
        KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN
    }
    
    public enum Color {
        WHITE, BLACK
    }
}
