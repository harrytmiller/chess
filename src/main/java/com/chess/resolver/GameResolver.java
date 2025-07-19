package com.chess.resolver;

import com.chess.model.Game;
import com.chess.model.Move;
import com.chess.model.Piece;
import com.chess.service.ChessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class GameResolver {
    
    @Autowired
    private ChessService chessService;
    
    private final Map<Long, Game> activeGames = new ConcurrentHashMap<>();
    private Long gameIdCounter = 1L;
    
    @QueryMapping
    public Game getGame(@Argument Long gameId) {
        Game game = activeGames.get(gameId);
        
        // Always check for game end conditions when fetching game state
        if (game != null && game.getStatus() == Game.GameStatus.ACTIVE) {
            chessService.checkForGameEnd(game);
        }
        
        return game;
    }
    
    @QueryMapping
    public List<Piece> getGamePieces(@Argument Long gameId) {
        Game game = activeGames.get(gameId);
        return game != null ? game.getPieces() : null;
    }
    
    @QueryMapping
    public boolean checkMoveValidity(@Argument Long gameId, @Argument int fromRow,
                                     @Argument int fromCol, @Argument int toRow, @Argument int toCol) {
        Game game = activeGames.get(gameId);
        if (game == null) {
            return false;
        }
        
        return chessService.isValidMove(game, fromRow, fromCol, toRow, toCol);
    }
    
    @MutationMapping
    public Game createGame(@Argument String gameType, 
                          @Argument String aiDifficulty) {
        Game game = chessService.initializeGame();
        game.setId(gameIdCounter++);
        
        // Set game type and AI settings
        if ("HUMAN_VS_AI".equals(gameType)) {
            game.setGameType(Game.GameType.HUMAN_VS_AI);
            game.setAiColor(Piece.Color.BLACK); // AI always plays black
            
            // Ensure human (WHITE) always starts first
            game.setCurrentPlayer(Piece.Color.WHITE);
            
            // Set AI difficulty
            if (aiDifficulty != null) {
                try {
                    game.setAiDifficulty(Game.AIDifficulty.valueOf(aiDifficulty.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    game.setAiDifficulty(Game.AIDifficulty.NORMAL); // Default
                }
            } else {
                game.setAiDifficulty(Game.AIDifficulty.NORMAL); // Default
            }
        } else {
            game.setGameType(Game.GameType.HUMAN_VS_HUMAN);
            // Keep the default currentPlayer as WHITE from initializeGame()
        }
        
        activeGames.put(game.getId(), game);
        return game;
    }
    
    @MutationMapping
    public Move makeMove(@Argument Long gameId, @Argument int fromRow,
                         @Argument int fromCol, @Argument int toRow, @Argument int toCol) {
        Game game = activeGames.get(gameId);
        if (game == null) {
            throw new RuntimeException("Game not found");
        }
        
        // Check if game is already over
        if (game.getStatus() != Game.GameStatus.ACTIVE) {
            throw new RuntimeException("Game is not active");
        }
        
        // Check for game end conditions before allowing move
        chessService.checkForGameEnd(game);
        
        if (game.getStatus() != Game.GameStatus.ACTIVE) {
            throw new RuntimeException("Game has ended");
        }
        
        // Don't allow moves if it's AI's turn
        if (game.isAIGame() && game.isAITurn()) {
            throw new RuntimeException("It's AI's turn");
        }
        
        // Execute the human move
        Move humanMove = chessService.executeMove(game, fromRow, fromCol, toRow, toCol);
        
        // Check if game ended after human move
        chessService.checkForGameEnd(game);
        
        // If it's an AI game and now it's AI's turn and game is still active, make AI move
        if (game.getStatus() == Game.GameStatus.ACTIVE && game.isAIGame() && game.isAITurn()) {
            // Make AI move in a separate thread to avoid blocking
            new Thread(() -> {
                try {
                    Thread.sleep(500); // Small delay to simulate "thinking"
                    
                    // Double-check game is still active before AI moves
                    if (game.getStatus() == Game.GameStatus.ACTIVE) {
                        Move aiMove = chessService.makeAIMove(game);
                        if (aiMove != null) {
                            System.out.println("AI move completed successfully");
                        } else {
                            System.out.println("AI move failed or game ended");
                        }
                        
                        // Always check for game end after AI move attempt
                        chessService.checkForGameEnd(game);
                        
                        // Log final game status
                        System.out.println("Game status after AI move: " + game.getStatus());
                        if (game.getWinner() != null) {
                            System.out.println("Winner: " + game.getWinner());
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error making AI move: " + e.getMessage());
                    e.printStackTrace();
                }
            }).start();
        }
        
        return humanMove;
    }
    
    @QueryMapping
    public boolean isAITurn(@Argument Long gameId) {
        Game game = activeGames.get(gameId);
        return game != null && game.isAITurn();
    }
}