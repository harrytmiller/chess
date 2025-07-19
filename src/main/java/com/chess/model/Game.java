package com.chess.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Game {
    private Long id;
    private GameStatus status;
    private Piece.Color currentPlayer;
    private Piece.Color winner;
    private LocalDateTime createdAt;
    private int moveCount = 0;
    private List<Piece> pieces = new ArrayList<>();
    private List<Move> moves = new ArrayList<>();
    
    // AI-related fields
    private GameType gameType;
    private AIDifficulty aiDifficulty;
    private Piece.Color aiColor;
    
    public Game() {
        this.status = GameStatus.ACTIVE;
        this.currentPlayer = Piece.Color.WHITE;
        this.createdAt = LocalDateTime.now();
        this.gameType = GameType.HUMAN_VS_HUMAN; // Default
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public GameStatus getStatus() { return status; }
    public void setStatus(GameStatus status) { this.status = status; }
    
    public Piece.Color getCurrentPlayer() { return currentPlayer; }
    public void setCurrentPlayer(Piece.Color currentPlayer) { this.currentPlayer = currentPlayer; }
    
    public Piece.Color getWinner() { return winner; }
    public void setWinner(Piece.Color winner) { this.winner = winner; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    public int getMoveCount() { return moveCount; }
    public void setMoveCount(int moveCount) { this.moveCount = moveCount; }
    
    public List<Piece> getPieces() { return pieces; }
    public void setPieces(List<Piece> pieces) { this.pieces = pieces; }
    
    public List<Move> getMoves() { return moves; }
    public void setMoves(List<Move> moves) { this.moves = moves; }
    
    // AI-related getters and setters
    public GameType getGameType() { return gameType; }
    public void setGameType(GameType gameType) { this.gameType = gameType; }
    
    public AIDifficulty getAiDifficulty() { return aiDifficulty; }
    public void setAiDifficulty(AIDifficulty aiDifficulty) { this.aiDifficulty = aiDifficulty; }
    
    public Piece.Color getAiColor() { return aiColor; }
    public void setAiColor(Piece.Color aiColor) { this.aiColor = aiColor; }
    
    // Helper methods
    public boolean isAIGame() {
        return gameType == GameType.HUMAN_VS_AI;
    }
    
    public boolean isAITurn() {
        return isAIGame() && currentPlayer == aiColor;
    }
    
    public enum GameStatus {
        ACTIVE, CHECKMATE, STALEMATE, DRAW, RESIGNED
    }
    
    public enum GameType {
        HUMAN_VS_HUMAN, HUMAN_VS_AI
    }
    
    public enum AIDifficulty {
        NORMAL, HARD, IMPOSSIBLE
    }
}