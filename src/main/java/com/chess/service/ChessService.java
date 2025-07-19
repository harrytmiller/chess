package com.chess.service;

import com.chess.model.Game;
import com.chess.model.Move;
import com.chess.model.Piece;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class ChessService {
    
    @Autowired
    private ChessAI chessAI;
    
    public Game initializeGame() {
        Game game = new Game();
        List<Piece> pieces = new ArrayList<>();
        
        // Initialize white pieces (bottom row)
        pieces.add(new Piece(Piece.PieceType.ROOK, Piece.Color.WHITE, 7, 0));
        pieces.add(new Piece(Piece.PieceType.KNIGHT, Piece.Color.WHITE, 7, 1));
        pieces.add(new Piece(Piece.PieceType.BISHOP, Piece.Color.WHITE, 7, 2));
        pieces.add(new Piece(Piece.PieceType.QUEEN, Piece.Color.WHITE, 7, 3));
        pieces.add(new Piece(Piece.PieceType.KING, Piece.Color.WHITE, 7, 4));
        pieces.add(new Piece(Piece.PieceType.BISHOP, Piece.Color.WHITE, 7, 5));
        pieces.add(new Piece(Piece.PieceType.KNIGHT, Piece.Color.WHITE, 7, 6));
        pieces.add(new Piece(Piece.PieceType.ROOK, Piece.Color.WHITE, 7, 7));
        
        for (int i = 0; i < 8; i++) {
            pieces.add(new Piece(Piece.PieceType.PAWN, Piece.Color.WHITE, 6, i));
        }
        
        pieces.add(new Piece(Piece.PieceType.ROOK, Piece.Color.BLACK, 0, 0));
        pieces.add(new Piece(Piece.PieceType.KNIGHT, Piece.Color.BLACK, 0, 1));
        pieces.add(new Piece(Piece.PieceType.BISHOP, Piece.Color.BLACK, 0, 2));
        pieces.add(new Piece(Piece.PieceType.QUEEN, Piece.Color.BLACK, 0, 3));
        pieces.add(new Piece(Piece.PieceType.KING, Piece.Color.BLACK, 0, 4));
        pieces.add(new Piece(Piece.PieceType.BISHOP, Piece.Color.BLACK, 0, 5));
        pieces.add(new Piece(Piece.PieceType.KNIGHT, Piece.Color.BLACK, 0, 6));
        pieces.add(new Piece(Piece.PieceType.ROOK, Piece.Color.BLACK, 0, 7));
        
        for (int i = 0; i < 8; i++) {
            pieces.add(new Piece(Piece.PieceType.PAWN, Piece.Color.BLACK, 1, i));
        }
        
        game.setPieces(pieces);
        return game;
    }
    
    // Enhanced method to make AI move with proper error handling
    public Move makeAIMove(Game game) {
        if (!game.isAIGame() || !game.isAITurn()) {
            System.out.println("Not AI's turn or not AI game");
            return null;
        }
        
        System.out.println("=== MAKING AI MOVE ===");
        System.out.println("Game ID: " + game.getId());
        System.out.println("Current player: " + game.getCurrentPlayer());
        System.out.println("AI color: " + game.getAiColor());
        
        // Check if AI has any valid moves before trying to get best move
        List<AIMove> possibleMoves = getAllValidMovesForPlayer(game, game.getCurrentPlayer());
        if (possibleMoves.isEmpty()) {
            System.out.println("AI has no valid moves - checking for checkmate/stalemate");
            checkForGameEnd(game);
            return null;
        }
        
        ChessAI.AIMove aiMove = chessAI.getBestMove(game, game.getAiDifficulty(), this);
        if (aiMove == null) {
            System.out.println("AI returned null move!");
            // If AI can't find a move but has valid moves, there might be an issue
            checkForGameEnd(game);
            return null;
        }
        
        System.out.println("AI wants to move: " + aiMove.fromRow + "," + aiMove.fromCol + " -> " + aiMove.toRow + "," + aiMove.toCol);
        
        // Validate the AI move before executing
        if (!isValidMove(game, aiMove.fromRow, aiMove.fromCol, aiMove.toRow, aiMove.toCol)) {
            System.out.println("ERROR: AI generated invalid move!");
            return null;
        }
        
        System.out.println("AI move is valid, executing...");
        return executeMove(game, aiMove.fromRow, aiMove.fromCol, aiMove.toRow, aiMove.toCol);
    }
    
    // Enhanced method to check for all game end conditions
    public void checkForGameEnd(Game game) {
        if (game.getStatus() != Game.GameStatus.ACTIVE) {
            return; // Game already ended
        }
        
        Piece.Color currentPlayer = game.getCurrentPlayer();
        List<AIMove> validMoves = getAllValidMovesForPlayer(game, currentPlayer);
        
        System.out.println("=== CHECKING GAME END ===");
        System.out.println("Current player: " + currentPlayer);
        System.out.println("Valid moves available: " + validMoves.size());
        
        if (validMoves.isEmpty()) {
            // No valid moves = checkmate (game over)
            System.out.println("CHECKMATE detected! (No valid moves available)");
            game.setStatus(Game.GameStatus.CHECKMATE);
            Piece.Color winner = (currentPlayer == Piece.Color.WHITE) ? 
                                Piece.Color.BLACK : Piece.Color.WHITE;
            game.setWinner(winner);
        } else {
            // Player has valid moves, game continues
            System.out.println("Game continues - player has " + validMoves.size() + " valid moves");
        }
    }
    
    // New method to get all valid moves for a player
    private List<AIMove> getAllValidMovesForPlayer(Game game, Piece.Color playerColor) {
        List<AIMove> validMoves = new ArrayList<>();
        
        List<Piece> playerPieces = game.getPieces().stream()
                .filter(p -> p.getColor() == playerColor)
                .toList();
        
        System.out.println("Checking moves for " + playerColor + " - found " + playerPieces.size() + " pieces");
        
        for (Piece piece : playerPieces) {
            System.out.println("Checking piece: " + piece.getType() + " at " + piece.getRow() + "," + piece.getCol());
            int pieceMoves = 0;
            
            for (int row = 0; row < 8; row++) {
                for (int col = 0; col < 8; col++) {
                    if (isValidMove(game, piece.getRow(), piece.getCol(), row, col)) {
                        validMoves.add(new AIMove(piece.getRow(), piece.getCol(), row, col, 0));
                        pieceMoves++;
                    }
                }
            }
            
            System.out.println("  Found " + pieceMoves + " valid moves for this piece");
        }
        
        System.out.println("Total valid moves for " + playerColor + ": " + validMoves.size());
        return validMoves;
    }
    
    public Move executeMove(Game game, int fromRow, int fromCol, int toRow, int toCol) {
        if (!isValidMove(game, fromRow, fromCol, toRow, toCol)) {
            throw new RuntimeException("Invalid move");
        }
        
        Piece piece = getPieceAt(game, fromRow, fromCol);
        Piece capturedPiece = getPieceAt(game, toRow, toCol);
        
        System.out.println("Executing move: " + piece.getType() + " " + piece.getColor() + 
                          " from " + fromRow + "," + fromCol + " to " + toRow + "," + toCol);
        
        if (capturedPiece != null) {
            System.out.println("Capturing: " + capturedPiece.getType() + " " + capturedPiece.getColor());
            game.getPieces().remove(capturedPiece);
        }
        
        piece.setRow(toRow);
        piece.setCol(toCol);
        piece.setHasMoved(true);
        
        // Pawn promotion
        if (piece.getType() == Piece.PieceType.PAWN) {
            if ((piece.getColor() == Piece.Color.WHITE && toRow == 0) || 
                (piece.getColor() == Piece.Color.BLACK && toRow == 7)) {
                System.out.println("Pawn promotion to Queen!");
                piece.setType(Piece.PieceType.QUEEN);
            }
        }
        
        Move move = new Move(fromRow, fromCol, toRow, toCol, piece.getType(), piece.getColor());
        move.setMoveNumber(game.getMoveCount() + 1);
        game.getMoves().add(move);
        game.setMoveCount(game.getMoveCount() + 1);
        
        // Switch players
        Piece.Color opponent = (game.getCurrentPlayer() == Piece.Color.WHITE) ? 
                              Piece.Color.BLACK : Piece.Color.WHITE;
        game.setCurrentPlayer(opponent);
        
        System.out.println("Move completed. Current player now: " + game.getCurrentPlayer());
        
        return move;
    }
    
    private boolean isKingInCheck(Game game, Piece.Color kingColor) {
        // Find the king
        Piece king = game.getPieces().stream()
                .filter(p -> p.getType() == Piece.PieceType.KING && p.getColor() == kingColor)
                .findFirst()
                .orElse(null);
        
        if (king == null) {
            System.out.println("WARNING: No king found for color " + kingColor);
            return false;
        }
        
        // Check if any opponent piece can attack the king
        Piece.Color opponentColor = (kingColor == Piece.Color.WHITE) ? 
                                   Piece.Color.BLACK : Piece.Color.WHITE;
        
        boolean inCheck = game.getPieces().stream()
                .filter(p -> p.getColor() == opponentColor)
                .anyMatch(p -> canPieceAttack(game, p, king.getRow(), king.getCol()));
        
        if (inCheck) {
            System.out.println(kingColor + " king is in check at " + king.getRow() + "," + king.getCol());
        }
        
        return inCheck;
    }
    
    private boolean canPieceAttack(Game game, Piece piece, int targetRow, int targetCol) {
        return isValidPieceMove(game, piece, piece.getRow(), piece.getCol(), targetRow, targetCol);
    }
    
    // Create a copy of the game to simulate moves
    private Game simulateMove(Game originalGame, int fromRow, int fromCol, int toRow, int toCol) {
        Game tempGame = new Game();
        tempGame.setCurrentPlayer(originalGame.getCurrentPlayer());
        
        // Copy pieces
        List<Piece> tempPieces = new ArrayList<>();
        for (Piece piece : originalGame.getPieces()) {
            Piece tempPiece = new Piece(piece.getType(), piece.getColor(), piece.getRow(), piece.getCol());
            tempPiece.setHasMoved(piece.isHasMoved());
            tempPieces.add(tempPiece);
        }
        tempGame.setPieces(tempPieces);
        
        // Execute the move on the temp game
        Piece piece = getPieceAt(tempGame, fromRow, fromCol);
        Piece capturedPiece = getPieceAt(tempGame, toRow, toCol);
        
        if (capturedPiece != null) {
            tempGame.getPieces().remove(capturedPiece);
        }
        
        piece.setRow(toRow);
        piece.setCol(toCol);
        
        return tempGame;
    }
    
    // Validate move without checking for check (to avoid recursion)
    private boolean isValidMoveWithoutCheckValidation(Game game, int fromRow, int fromCol, int toRow, int toCol) {
        if (fromRow < 0 || fromRow > 7 || fromCol < 0 || fromCol > 7 ||
            toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
            return false;
        }
        
        Piece piece = getPieceAt(game, fromRow, fromCol);
        if (piece == null) {
            return false;
        }
        
        if (fromRow == toRow && fromCol == toCol) {
            return false;
        }
        
        Piece targetPiece = getPieceAt(game, toRow, toCol);
        if (targetPiece != null && targetPiece.getColor() == piece.getColor()) {
            return false;
        }
        
        return isValidPieceMove(game, piece, fromRow, fromCol, toRow, toCol);
    }
    
    public boolean isValidMove(Game game, int fromRow, int fromCol, int toRow, int toCol) {
        if (!isValidMoveWithoutCheckValidation(game, fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        Piece piece = getPieceAt(game, fromRow, fromCol);
        if (piece.getColor() != game.getCurrentPlayer()) {
            return false;
        }
        
        // Check if this move would put own king in check
        Game tempGame = simulateMove(game, fromRow, fromCol, toRow, toCol);
        return !isKingInCheck(tempGame, piece.getColor());
    }
    
    private boolean isValidPieceMove(Game game, Piece piece, int fromRow, int fromCol, int toRow, int toCol) {
        int rowDiff = Math.abs(toRow - fromRow);
        int colDiff = Math.abs(toCol - fromCol);
        
        switch (piece.getType()) {
            case PAWN:
                return isValidPawnMove(game, piece, fromRow, fromCol, toRow, toCol);
            case ROOK:
                return (rowDiff == 0 || colDiff == 0) && isPathClear(game, fromRow, fromCol, toRow, toCol);
            case BISHOP:
                return (rowDiff == colDiff) && isPathClear(game, fromRow, fromCol, toRow, toCol);
            case QUEEN:
                return (rowDiff == 0 || colDiff == 0 || rowDiff == colDiff) && 
                       isPathClear(game, fromRow, fromCol, toRow, toCol);
            case KING:
                return rowDiff <= 1 && colDiff <= 1;
            case KNIGHT:
                return (rowDiff == 2 && colDiff == 1) || (rowDiff == 1 && colDiff == 2);
            default:
                return false;
        }
    }
    
    private boolean isValidPawnMove(Game game, Piece pawn, int fromRow, int fromCol, int toRow, int toCol) {
        int direction = (pawn.getColor() == Piece.Color.WHITE) ? -1 : 1;
        int rowDiff = toRow - fromRow;
        int colDiff = Math.abs(toCol - fromCol);
        
        if (colDiff == 0) {
            // Moving forward
            if (rowDiff == direction && getPieceAt(game, toRow, toCol) == null) {
                return true;
            }
            // FIXED: Double move from starting position - must check both squares are empty
            if (!pawn.isHasMoved() && rowDiff == 2 * direction && 
                getPieceAt(game, toRow, toCol) == null && 
                getPieceAt(game, fromRow + direction, fromCol) == null) {
                return true;
            }
        }
        else if (colDiff == 1 && rowDiff == direction) {
            // Diagonal capture
            Piece targetPiece = getPieceAt(game, toRow, toCol);
            return targetPiece != null && targetPiece.getColor() != pawn.getColor();
        }
        
        return false;
    }
    
    private boolean isPathClear(Game game, int fromRow, int fromCol, int toRow, int toCol) {
        int rowStep = Integer.compare(toRow, fromRow);
        int colStep = Integer.compare(toCol, fromCol);
        
        int currentRow = fromRow + rowStep;
        int currentCol = fromCol + colStep;
        
        while (currentRow != toRow || currentCol != toCol) {
            if (getPieceAt(game, currentRow, currentCol) != null) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }
    
    public Piece getPieceAt(Game game, int row, int col) {
        return game.getPieces().stream()
                .filter(piece -> piece.getRow() == row && piece.getCol() == col)
                .findFirst()
                .orElse(null);
    }
    
    // Helper class for AI moves (should be in ChessAI but needed here for validation)
    public static class AIMove {
        public int fromRow, fromCol, toRow, toCol;
        public int score;
        
        public AIMove(int fromRow, int fromCol, int toRow, int toCol, int score) {
            this.fromRow = fromRow;
            this.fromCol = fromCol;
            this.toRow = toRow;
            this.toCol = toCol;
            this.score = score;
        }
    }
}