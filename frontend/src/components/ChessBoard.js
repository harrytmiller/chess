import { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';

const MAKE_MOVE = gql`
  mutation MakeMove($gameId: ID!, $fromRow: Int!, $fromCol: Int!, $toRow: Int!, $toCol: Int!) {
    makeMove(gameId: $gameId, fromRow: $fromRow, fromCol: $fromCol, toRow: $toRow, toCol: $toCol) {
      fromRow
      fromCol
      toRow
      toCol
      pieceType
      pieceColor
      moveNumber
    }
  }
`;

const GET_GAME = gql`
  query GetGame($gameId: ID!) {
    getGame(gameId: $gameId) {
      id
      status
      currentPlayer
      winner
      gameType
      aiDifficulty
      aiColor
      pieces {
        type
        color
        row
        col
        hasMoved
      }
    }
  }
`;

const IS_AI_TURN = gql`
  query IsAITurn($gameId: ID!) {
    isAITurn(gameId: $gameId)
  }
`;

const ChessBoard = ({ game, gameId, onMoveComplete }) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [moveError, setMoveError] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [makeMove, { loading: moveLoading }] = useMutation(MAKE_MOVE);
  
  // Query to check if it's AI's turn
  const { data: aiTurnData, refetch: refetchAITurn } = useQuery(IS_AI_TURN, {
    variables: { gameId },
    skip: !game?.gameType || game.gameType !== 'HUMAN_VS_AI',
    pollInterval: game?.gameType === 'HUMAN_VS_AI' && game?.status === 'ACTIVE' ? 2000 : 0, // Poll every 2 seconds for active AI games
  });
  
  // Query to get updated game state
  const { refetch: refetchGame } = useQuery(GET_GAME, {
    variables: { gameId },
    skip: true, // We'll manually refetch when needed
    fetchPolicy: 'network-only', // Always fetch from network, not cache
  });

  useEffect(() => {
    if (game?.gameType === 'HUMAN_VS_AI' && aiTurnData?.isAITurn && !isAIThinking) {
      console.log('AI turn detected, starting AI thinking...');
      setIsAIThinking(true);
      
      // Wait for AI move to complete, then refetch
      const timeout = setTimeout(async () => {
        console.log('Checking for AI move completion...');
        try {
          const gameResult = await refetchGame();
          await refetchAITurn();
          console.log('Refetch completed, game status:', gameResult.data?.getGame?.status);
          setIsAIThinking(false);
          
          // Force the parent component to update with the new game state
          if (onMoveComplete) {
            onMoveComplete();
          }
        } catch (error) {
          console.error('Error during AI move refetch:', error);
          setIsAIThinking(false);
        }
      }, 2000); // Reduced to 2 seconds since AI completes quickly
      
      return () => clearTimeout(timeout);
    }
  }, [aiTurnData?.isAITurn, game?.gameType, refetchGame, refetchAITurn, onMoveComplete, isAIThinking]);

  // Additional effect to handle when AI turn ends
  useEffect(() => {
    if (game?.gameType === 'HUMAN_VS_AI' && !aiTurnData?.isAITurn && isAIThinking) {
      console.log('AI turn ended, stopping thinking indicator');
      setIsAIThinking(false);
      if (onMoveComplete) {
        onMoveComplete();
      }
    }
  }, [aiTurnData?.isAITurn, game?.gameType, isAIThinking, onMoveComplete]);

  const handleSquareClick = async (row, col) => {
    console.log('Square clicked:', row, col);
    
    // Don't allow moves during AI turn or when AI is thinking
    if (isAIThinking || (game?.gameType === 'HUMAN_VS_AI' && aiTurnData?.isAITurn)) {
      console.log('Blocking move - AI is thinking or it\'s AI turn');
      return;
    }
    
    // Clear any previous errors
    setMoveError(null);
    
    if (!selectedSquare) {
      const piece = getPieceAt(row, col);
      console.log('Piece at clicked square:', piece);
      console.log('Game type:', game?.gameType);
      console.log('Current player:', game?.currentPlayer);
      
      if (piece) {
        // For AI games, human always plays white
        if (game?.gameType === 'HUMAN_VS_AI') {
          if (piece.color === 'WHITE' && game.currentPlayer === 'WHITE') {
            console.log('Selecting WHITE piece in AI game:', piece);
            setSelectedSquare({ row, col });
            await getValidMovesForPiece(row, col);
          } else {
            console.log('Cannot select piece in AI game - not your turn or not your color');
          }
        } else {
          // Human vs Human - allow selecting current player's pieces
          if (piece.color === game?.currentPlayer) {
            console.log('Selecting piece in human game:', piece);
            setSelectedSquare({ row, col });
            await getValidMovesForPiece(row, col);
          } else {
            console.log('Cannot select piece - not current player');
          }
        }
      } else {
        console.log('No piece at this square');
      }
    } else {
      console.log('Making move from', selectedSquare, 'to', { row, col });
      try {
        const result = await makeMove({
          variables: {
            gameId,
            fromRow: selectedSquare.row,
            fromCol: selectedSquare.col,
            toRow: row,
            toCol: col,
          },
        });
        console.log('Move result:', result);
        setSelectedSquare(null);
        setValidMoves([]);
        
        // Always trigger onMoveComplete after successful move
        if (onMoveComplete) {
          onMoveComplete();
        }
      } catch (error) {
        console.error('Move error:', error);
        setMoveError('Invalid move');
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  };

  const getValidMovesForPiece = async (row, col) => {
    const piece = getPieceAt(row, col);
    if (!piece) return;

    const moves = [];
    
    // Test each square on the board to see if it's a valid move
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === row && c === col) continue;
        
        // First check basic movement pattern
        if (isValidMovePattern(piece, row, col, r, c)) {
          // Then check if this move would be legal (doesn't put own king in check)
          if (isLegalMove(row, col, r, c)) {
            moves.push({ row: r, col: c });
          }
        }
      }
    }
    
    setValidMoves(moves);
  };

  // Check if a move is legal (doesn't put own king in check)
  const isLegalMove = (fromRow, fromCol, toRow, toCol) => {
    // Simulate the move
    const simulatedGame = simulateMove(fromRow, fromCol, toRow, toCol);
    
    // Check if this move would put own king in check
    const piece = getPieceAt(fromRow, fromCol);
    return !isKingInCheck(simulatedGame, piece.color);
  };

  // Simulate a move and return the resulting game state
  const simulateMove = (fromRow, fromCol, toRow, toCol) => {
    if (!game?.pieces) return null;
    
    // Create a copy of the pieces array
    const newPieces = game.pieces.map(piece => ({
      ...piece
    }));
    
    // Find the piece to move
    const pieceIndex = newPieces.findIndex(p => p.row === fromRow && p.col === fromCol);
    if (pieceIndex === -1) return null;
    
    // Remove any piece at destination (capture)
    const capturedIndex = newPieces.findIndex(p => p.row === toRow && p.col === toCol);
    if (capturedIndex !== -1) {
      newPieces.splice(capturedIndex, 1);
    }
    
    // Move the piece
    newPieces[pieceIndex] = {
      ...newPieces[pieceIndex],
      row: toRow,
      col: toCol
    };
    
    return { pieces: newPieces };
  };

  // Check if a king is in check in a given game state
  const isKingInCheck = (gameState, kingColor) => {
    if (!gameState?.pieces) return false;
    
    // Find the king
    const king = gameState.pieces.find(p => p.type === 'KING' && p.color === kingColor);
    if (!king) return false;
    
    // Check if any opponent piece can attack the king
    const opponentColor = kingColor === 'WHITE' ? 'BLACK' : 'WHITE';
    const opponentPieces = gameState.pieces.filter(p => p.color === opponentColor);
    
    for (let piece of opponentPieces) {
      if (canPieceAttackSquare(gameState, piece, king.row, king.col)) {
        return true;
      }
    }
    return false;
  };

  // Check if a piece can attack a specific square
  const canPieceAttackSquare = (gameState, piece, targetRow, targetCol) => {
    const rowDiff = Math.abs(targetRow - piece.row);
    const colDiff = Math.abs(targetCol - piece.col);
    
    switch (piece.type) {
      case 'PAWN':
        const direction = piece.color === 'WHITE' ? -1 : 1;
        const rowDiffSigned = targetRow - piece.row;
        // Pawns attack diagonally
        return colDiff === 1 && rowDiffSigned === direction;
        
      case 'ROOK':
        return (rowDiff === 0 || colDiff === 0) && isPathClearInGame(gameState, piece.row, piece.col, targetRow, targetCol);
        
      case 'BISHOP':
        return (rowDiff === colDiff) && isPathClearInGame(gameState, piece.row, piece.col, targetRow, targetCol);
        
      case 'QUEEN':
        return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) && 
               isPathClearInGame(gameState, piece.row, piece.col, targetRow, targetCol);
               
      case 'KING':
        return rowDiff <= 1 && colDiff <= 1;
        
      case 'KNIGHT':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        
      default:
        return false;
    }
  };

  // Check if path is clear in a given game state
  const isPathClearInGame = (gameState, fromRow, fromCol, toRow, toCol) => {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (gameState.pieces.find(p => p.row === currentRow && p.col === currentCol)) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  };

  const isValidMovePattern = (piece, fromRow, fromCol, toRow, toCol) => {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const targetPiece = getPieceAt(toRow, toCol);
    
    // Can't capture your own pieces
    if (targetPiece && targetPiece.color === piece.color) {
      return false;
    }
    
    // Basic movement patterns (without considering check)
    switch (piece.type) {
      case 'PAWN':
        const direction = piece.color === 'WHITE' ? -1 : 1;
        const rowDiffSigned = toRow - fromRow;
        
        if (colDiff === 0) {
          // Forward moves
          if (rowDiffSigned === direction && !targetPiece) return true;
          if (piece.hasMoved === false && rowDiffSigned === 2 * direction && !targetPiece && !getPieceAt(fromRow + direction, fromCol)) {
            return true;
          }
        }
        else if (colDiff === 1 && rowDiffSigned === direction && targetPiece) {
          // Diagonal captures only
          return true;
        }
        return false;
        
      case 'ROOK':
        return (rowDiff === 0 || colDiff === 0) && isPathClearSimple(fromRow, fromCol, toRow, toCol);
        
      case 'BISHOP':
        return (rowDiff === colDiff) && isPathClearSimple(fromRow, fromCol, toRow, toCol);
        
      case 'QUEEN':
        return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) && 
               isPathClearSimple(fromRow, fromCol, toRow, toCol);
               
      case 'KING':
        return rowDiff <= 1 && colDiff <= 1;
        
      case 'KNIGHT':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        
      default:
        return false;
    }
  };

  const isPathClearSimple = (fromRow, fromCol, toRow, toCol) => {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (getPieceAt(currentRow, currentCol)) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  };

  const getPieceAt = (row, col) => {
    return game?.pieces?.find(piece => piece.row === row && piece.col === col);
  };

  const getPieceSymbol = (piece) => {
    if (!piece) return '';
    
    const pieceSymbols = {
      'WHITE': {
        'KING': '♔',
        'QUEEN': '♕', 
        'ROOK': '♖',
        'BISHOP': '♗',
        'KNIGHT': '♘',
        'PAWN': '♙'
      },
      'BLACK': {
        'KING': '♚',
        'QUEEN': '♛',
        'ROOK': '♜', 
        'BISHOP': '♝',
        'KNIGHT': '♞',
        'PAWN': '♟'
      }
    };
    
    return pieceSymbols[piece.color]?.[piece.type] || piece.type[0];
  };

  const isValidMoveSquare = (row, col) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const getCurrentPlayerDisplay = () => {
    if (game?.gameType === 'HUMAN_VS_AI') {
      if (game.currentPlayer === 'WHITE') {
        return 'Your turn';
      } else {
        return isAIThinking ? 'AI is thinking...' : 'AI\'s turn';
      }
    } else {
      return `${game?.currentPlayer}'s turn`;
    }
  };

  const isBoardDisabled = () => {
    return isAIThinking || (game?.gameType === 'HUMAN_VS_AI' && aiTurnData?.isAITurn);
  };

  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <div className="game-info">
        <div className="current-player">
          {getCurrentPlayerDisplay()}
        </div>
        {game.gameType === 'HUMAN_VS_AI' && (
          <div className="game-type-info">
            Playing against AI ({game.aiDifficulty?.toLowerCase()})
          </div>
        )}
      </div>

      {moveError && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {moveError}
        </div>
      )}
      
      <div className={`chess-board ${isBoardDisabled() ? 'disabled' : ''}`}>
        {Array.from({ length: 8 }, (_, row) => (
          <div key={row} className="chess-row">
            {Array.from({ length: 8 }, (_, col) => {
              const piece = getPieceAt(row, col);
              const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
              const isValidMove = isValidMoveSquare(row, col);
              const isLight = (row + col) % 2 === 0;
              
              return (
                <div
                  key={col}
                  className={`chess-square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSquareClick(row, col)}
                  style={{
                    cursor: isBoardDisabled() ? 'not-allowed' : 'pointer',
                    opacity: isBoardDisabled() ? 0.7 : 1
                  }}
                >
                  {isValidMove && <div className="valid-move-overlay"></div>}
                  {piece && (
                    <span className="piece">
                      {getPieceSymbol(piece)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {isAIThinking && (
        <div className="ai-thinking-indicator">
          <div className="spinner"></div>
          <span>AI is thinking...</span>
        </div>
      )}

      <style jsx>{`
        .game-info {
          margin-bottom: 15px;
          text-align: center;
        }

        .current-player {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }

        .game-type-info {
          font-size: 14px;
          color: #666;
        }

        .chess-board.disabled {
          pointer-events: none;
        }

        .ai-thinking-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 15px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
          font-size: 14px;
          color: #666;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChessBoard;