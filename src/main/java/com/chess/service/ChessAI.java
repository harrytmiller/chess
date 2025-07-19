package com.chess.service;

import com.chess.model.Game;
import com.chess.model.Piece;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class ChessAI {
    
    private Random random = new Random();
    
    // Piece values for evaluation
    private static final int PAWN_VALUE = 100;
    private static final int KNIGHT_VALUE = 320;
    private static final int BISHOP_VALUE = 330;
    private static final int ROOK_VALUE = 500;
    private static final int QUEEN_VALUE = 900;
    private static final int KING_VALUE = 20000;
    
    // Position bonus tables (for center control, development)
    private static final int[][] PAWN_POSITION_BONUS = {
        {0,  0,  0,  0,  0,  0,  0,  0},
        {50, 50, 50, 50, 50, 50, 50, 50},
        {10, 10, 20, 30, 30, 20, 10, 10},
        {5,  5, 10, 25, 25, 10,  5,  5},
        {0,  0,  0, 20, 20,  0,  0,  0},
        {5, -5,-10,  0,  0,-10, -5,  5},
        {5, 10, 10,-20,-20, 10, 10,  5},
        {0,  0,  0,  0,  0,  0,  0,  0}
    };
    
    private static final int[][] KNIGHT_POSITION_BONUS = {
        {-50,-40,-30,-30,-30,-30,-40,-50},
        {-40,-20,  0,  0,  0,  0,-20,-40},
        {-30,  0, 10, 15, 15, 10,  0,-30},
        {-30,  5, 15, 20, 20, 15,  5,-30},
        {-30,  0, 15, 20, 20, 15,  0,-30},
        {-30,  5, 10, 15, 15, 10,  5,-30},
        {-40,-20,  0,  5,  5,  0,-20,-40},
        {-50,-40,-30,-30,-30,-30,-40,-50}
    };
    
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
    
    public AIMove getBestMove(Game game, Game.AIDifficulty difficulty, ChessService chessService) {
        Piece.Color aiColor = game.getAiColor();
        
        // Add some randomness for normal difficulty
        boolean addRandomness = (difficulty == Game.AIDifficulty.NORMAL);
        
        List<AIMove> possibleMoves = getAllPossibleMoves(game, aiColor, chessService);
        
        System.out.println("=== AI MOVE GENERATION ===");
        System.out.println("AI Color: " + aiColor);
        System.out.println("Difficulty: " + difficulty);
        System.out.println("Found " + possibleMoves.size() + " possible moves");
        
        if (possibleMoves.isEmpty()) {
            System.out.println("ERROR: No valid moves found for AI!");
            return null;
        }
        
        AIMove bestMove = null;
        int bestScore = Integer.MIN_VALUE;
        
        // Log first few moves for debugging
        for (int i = 0; i < Math.min(5, possibleMoves.size()); i++) {
            AIMove move = possibleMoves.get(i);
            System.out.println("Move " + i + ": " + move.fromRow + "," + move.fromCol + " -> " + move.toRow + "," + move.toCol);
        }
        
        // For impossible difficulty, try opening book first
        if (difficulty == Game.AIDifficulty.IMPOSSIBLE && game.getMoveCount() < 6) {
            AIMove openingMove = getOpeningMove(game, aiColor, chessService);
            if (openingMove != null) {
                System.out.println("Using opening book move: " + openingMove.fromRow + "," + openingMove.fromCol + " -> " + openingMove.toRow + "," + openingMove.toCol);
                return openingMove;
            }
        }
        
        // Evaluate each possible move
        for (AIMove move : possibleMoves) {
            try {
                // Simulate the move
                Game tempGame = simulateMove(game, move.fromRow, move.fromCol, move.toRow, move.toCol);
                
                // Use simple evaluation for move selection
                int score = evaluateBoard(tempGame, aiColor);
                
                // Add slight randomness for normal difficulty
                if (addRandomness) {
                    score += random.nextInt(50) - 25;
                }
                
                // Bonus for capturing pieces
                Piece capturedPiece = getPieceAt(game, move.toRow, move.toCol);
                if (capturedPiece != null && capturedPiece.getColor() != aiColor) {
                    score += getPieceValue(capturedPiece) / 2; // Capture bonus
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                    bestMove.score = score;
                }
            } catch (Exception e) {
                System.err.println("Error evaluating move " + move.fromRow + "," + move.fromCol + " -> " + move.toRow + "," + move.toCol + ": " + e.getMessage());
            }
        }
        
        if (bestMove != null) {
            System.out.println("Selected move: " + bestMove.fromRow + "," + bestMove.fromCol + " -> " + bestMove.toRow + "," + bestMove.toCol + " (score: " + bestMove.score + ")");
        } else {
            System.out.println("ERROR: Could not select any move from " + possibleMoves.size() + " possibilities!");
        }
        
        return bestMove;
    }
    
    private AIMove getOpeningMove(Game game, Piece.Color aiColor, ChessService chessService) {
        // Simple opening book for black
        if (aiColor == Piece.Color.BLACK) {
            List<AIMove> possibleMoves = getAllPossibleMoves(game, aiColor, chessService);
            
            // Prefer central pawn moves, knight development
            for (AIMove move : possibleMoves) {
                Piece piece = getPieceAt(game, move.fromRow, move.fromCol);
                if (piece == null) continue;
                
                // King's pawn
                if (piece.getType() == Piece.PieceType.PAWN && move.fromRow == 1 && move.fromCol == 4) {
                    return move;
                }
                // Queen's pawn
                if (piece.getType() == Piece.PieceType.PAWN && move.fromRow == 1 && move.fromCol == 3) {
                    return move;
                }
                // Knight development
                if (piece.getType() == Piece.PieceType.KNIGHT && 
                    (move.toRow == 2 && (move.toCol == 2 || move.toCol == 5))) {
                    return move;
                }
            }
        }
        return null;
    }
    
    private int evaluateBoard(Game game, Piece.Color aiColor) {
        int score = 0;
        
        for (Piece piece : game.getPieces()) {
            int pieceValue = getPieceValue(piece);
            int positionBonus = getPositionBonus(piece);
            
            int totalValue = pieceValue + positionBonus;
            
            if (piece.getColor() == aiColor) {
                score += totalValue;
            } else {
                score -= totalValue;
            }
        }
        
        // Add mobility bonus (simplified) - only if moves exist
        try {
            List<AIMove> aiMoves = getAllPossibleMoves(game, aiColor, null);
            List<AIMove> opponentMoves = getAllPossibleMoves(game, getOpponentColor(aiColor), null);
            
            if (!aiMoves.isEmpty()) {
                score += aiMoves.size() * 10;
            }
            if (!opponentMoves.isEmpty()) {
                score -= opponentMoves.size() * 10;
            }
        } catch (Exception e) {
            // If mobility calculation fails, continue with material evaluation
            System.err.println("Error calculating mobility: " + e.getMessage());
        }
        
        return score;
    }
    
    private int getPieceValue(Piece piece) {
        switch (piece.getType()) {
            case PAWN: return PAWN_VALUE;
            case KNIGHT: return KNIGHT_VALUE;
            case BISHOP: return BISHOP_VALUE;
            case ROOK: return ROOK_VALUE;
            case QUEEN: return QUEEN_VALUE;
            case KING: return KING_VALUE;
            default: return 0;
        }
    }
    
    private int getPositionBonus(Piece piece) {
        int row = piece.getRow();
        int col = piece.getCol();
        
        // Flip row for black pieces
        if (piece.getColor() == Piece.Color.BLACK) {
            row = 7 - row;
        }
        
        switch (piece.getType()) {
            case PAWN:
                return PAWN_POSITION_BONUS[row][col];
            case KNIGHT:
                return KNIGHT_POSITION_BONUS[row][col];
            case BISHOP:
            case ROOK:
                // Prefer center squares
                return (3 - Math.abs(3 - row)) + (3 - Math.abs(3 - col));
            case QUEEN:
                // Queens are good in center but not too early
                return ((3 - Math.abs(3 - row)) + (3 - Math.abs(3 - col))) / 2;
            case KING:
                // Kings prefer corners in endgame, but we'll keep it simple
                return 0;
            default:
                return 0;
        }
    }
    
    private List<AIMove> getAllPossibleMoves(Game game, Piece.Color color, ChessService chessService) {
        List<AIMove> moves = new ArrayList<>();
        
        List<Piece> pieces = game.getPieces().stream()
                .filter(p -> p.getColor() == color)
                .toList();
        
        for (Piece piece : pieces) {
            for (int row = 0; row < 8; row++) {
                for (int col = 0; col < 8; col++) {
                    try {
                        if (chessService != null) {
                            // Use proper validation when ChessService is available
                            if (chessService.isValidMove(game, piece.getRow(), piece.getCol(), row, col)) {
                                moves.add(new AIMove(piece.getRow(), piece.getCol(), row, col, 0));
                            }
                        } else {
                            // For evaluation purposes when chessService is null, use simplified validation
                            if (isBasicValidMove(game, piece, piece.getRow(), piece.getCol(), row, col)) {
                                moves.add(new AIMove(piece.getRow(), piece.getCol(), row, col, 0));
                            }
                        }
                    } catch (Exception e) {
                        // Skip this move if validation fails
                        continue;
                    }
                }
            }
        }
        
        return moves;
    }
    
    private Game simulateMove(Game originalGame, int fromRow, int fromCol, int toRow, int toCol) {
        Game tempGame = new Game();
        tempGame.setId(originalGame.getId());
        tempGame.setCurrentPlayer(originalGame.getCurrentPlayer());
        tempGame.setStatus(originalGame.getStatus());
        tempGame.setMoveCount(originalGame.getMoveCount());
        tempGame.setGameType(originalGame.getGameType());
        tempGame.setAiDifficulty(originalGame.getAiDifficulty());
        tempGame.setAiColor(originalGame.getAiColor());
        
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
        if (piece != null) {
            Piece capturedPiece = getPieceAt(tempGame, toRow, toCol);
            if (capturedPiece != null) {
                tempGame.getPieces().remove(capturedPiece);
            }
            piece.setRow(toRow);
            piece.setCol(toCol);
            piece.setHasMoved(true);
        }
        
        return tempGame;
    }
    
    // Helper method to get piece at position
    private Piece getPieceAt(Game game, int row, int col) {
        return game.getPieces().stream()
                .filter(piece -> piece.getRow() == row && piece.getCol() == col)
                .findFirst()
                .orElse(null);
    }
    
    // Basic move validation for when chessService is not available
    private boolean isBasicValidMove(Game game, Piece piece, int fromRow, int fromCol, int toRow, int toCol) {
        if (fromRow == toRow && fromCol == toCol) return false;
        
        Piece targetPiece = getPieceAt(game, toRow, toCol);
        if (targetPiece != null && targetPiece.getColor() == piece.getColor()) {
            return false;
        }
        
        return isValidPieceMove(game, piece, fromRow, fromCol, toRow, toCol);
    }
    
    private boolean isValidPieceMove(Game game, Piece piece, int fromRow, int fromCol, int targetRow, int targetCol) {
        int rowDiff = Math.abs(targetRow - fromRow);
        int colDiff = Math.abs(targetCol - fromCol);
        
        switch (piece.getType()) {
            case PAWN:
                return isValidPawnMove(game, piece, fromRow, fromCol, targetRow, targetCol);
            case ROOK:
                return (rowDiff == 0 || colDiff == 0) && isPathClearInGame(game, fromRow, fromCol, targetRow, targetCol);
            case BISHOP:
                return (rowDiff == colDiff) && isPathClearInGame(game, fromRow, fromCol, targetRow, targetCol);
            case QUEEN:
                return (rowDiff == 0 || colDiff == 0 || rowDiff == colDiff) && 
                       isPathClearInGame(game, fromRow, fromCol, targetRow, targetCol);
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
            // Double move from starting position
            if (!pawn.isHasMoved() && rowDiff == 2 * direction && 
                getPieceAt(game, toRow, toCol) == null) {
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
    
    private boolean isPathClearInGame(Game game, int fromRow, int fromCol, int toRow, int toCol) {
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
    
    private Piece.Color getOpponentColor(Piece.Color color) {
        return color == Piece.Color.WHITE ? Piece.Color.BLACK : Piece.Color.WHITE;
    }
}
   