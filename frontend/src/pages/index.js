import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import ChessBoard from '../components/ChessBoard';
import GameModal from '../components/GameModal';

const CREATE_GAME = gql`
  mutation CreateGame($gameType: String, $aiDifficulty: String) {
    createGame(gameType: $gameType, aiDifficulty: $aiDifficulty) {
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
      moveCount
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

export default function Home() {
  const [gameId, setGameId] = useState(null);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ type: null, visible: false });
  const [showCheckMessage, setShowCheckMessage] = useState(false);
  const [createGame, { loading: createLoading }] = useMutation(CREATE_GAME);
  const { data: gameData, refetch, loading: queryLoading } = useQuery(GET_GAME, {
    variables: { gameId },
    skip: !gameId,
    fetchPolicy: 'cache-and-network',
    pollInterval: gameId ? 1000 : 0,
  });

  // Check for check condition only when move count changes (after moves are made)
  useEffect(() => {
    if (gameData?.getGame && gameData.getGame.status === 'ACTIVE') {
      const game = gameData.getGame;
      
      let shouldShowCheck = false;
      
      if (game.gameType === 'HUMAN_VS_AI') {
        // Only show check message if human player (WHITE) is in check
        // This should trigger after AI moves (when it's white's turn to move)
        if (game.currentPlayer === 'WHITE') {
          shouldShowCheck = isKingInCheck(game, 'WHITE');
          console.log('After AI move - checking if WHITE king in check:', shouldShowCheck);
        }
      } else {
        // Human vs Human - show check for current player
        shouldShowCheck = isKingInCheck(game, game.currentPlayer);
        console.log('Human vs Human - checking if', game.currentPlayer, 'king in check:', shouldShowCheck);
      }
      
      // Update check status
      setShowCheckMessage(shouldShowCheck);
      if (shouldShowCheck && modalState.type !== 'check') {
        setModalState({ type: 'check', visible: true });
      } else if (!shouldShowCheck && modalState.type === 'check') {
        setModalState({ type: null, visible: false });
      }
    }
  }, [gameData?.getGame?.moveCount]); // Only run when move count changes (after moves)State.type]); // Run whenever gameData changes

  const handleCreateGame = async (gameType = 'HUMAN_VS_HUMAN', aiDifficulty = null) => {
    try {
      setError(null);
      const result = await createGame({
        variables: { gameType, aiDifficulty }
      });
      setGameId(result.data.createGame.id);
      setModalState({ type: null, visible: false });
      setShowCheckMessage(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCreateAIGame = (difficulty) => {
    handleCreateGame('HUMAN_VS_AI', difficulty);
  };

  const isKingInCheck = (game, kingColor) => {
    if (!game?.pieces) return false;
    const king = game.pieces.find(p => p.type === 'KING' && p.color === kingColor);
    if (!king) return false;
    
    console.log(`Checking if ${kingColor} king at ${king.row},${king.col} is in check`);
    
    const opponentColor = kingColor === 'WHITE' ? 'BLACK' : 'WHITE';
    const opponentPieces = game.pieces.filter(p => p.color === opponentColor);
    
    for (let piece of opponentPieces) {
      const canAttack = canPieceAttack(game, piece, king.row, king.col);
      if (piece.type === 'PAWN') {
        console.log(`${piece.color} pawn at ${piece.row},${piece.col} can attack king: ${canAttack}`);
      }
      if (canAttack) {
        console.log(`${piece.color} ${piece.type} at ${piece.row},${piece.col} is attacking the king!`);
        return true;
      }
    }
    return false;
  };

  const canPieceAttack = (game, piece, targetRow, targetCol) => {
    const rowDiff = Math.abs(targetRow - piece.row);
    const colDiff = Math.abs(targetCol - piece.col);
    
    switch (piece.type) {
      case 'PAWN':
        const direction = piece.color === 'WHITE' ? -1 : 1;
        const rowDiffSigned = targetRow - piece.row;
        // Pawns attack diagonally one square in their forward direction
        const isValidPawnAttack = colDiff === 1 && rowDiffSigned === direction;
        console.log(`Pawn ${piece.color} at ${piece.row},${piece.col} checking attack on ${targetRow},${targetCol}: rowDiff=${rowDiffSigned}, colDiff=${colDiff}, direction=${direction}, canAttack=${isValidPawnAttack}`);
        return isValidPawnAttack;
      case 'ROOK':
        return (rowDiff === 0 || colDiff === 0) && isPathClear(game, piece.row, piece.col, targetRow, targetCol);
      case 'BISHOP':
        return rowDiff === colDiff && isPathClear(game, piece.row, piece.col, targetRow, targetCol);
      case 'QUEEN':
        return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) && isPathClear(game, piece.row, piece.col, targetRow, targetCol);
      case 'KING':
        return rowDiff <= 1 && colDiff <= 1;
      case 'KNIGHT':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      default:
        return false;
    }
  };

  const isPathClear = (game, fromRow, fromCol, toRow, toCol) => {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    while (currentRow !== toRow || currentCol !== toCol) {
      if (game.pieces.find(p => p.row === currentRow && p.col === currentCol)) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  };

  const handleMoveComplete = () => {
    refetch().then((result) => {
      const game = result.data.getGame;
      if (game.status === 'CHECKMATE') {
        setModalState({ type: 'checkmate', visible: true });
        setShowCheckMessage(false);
      }
      // Check detection for regular check is handled by useEffect
    }).catch((error) => {
      console.error('Error refetching game:', error);
    });
  };

  const handleModalOk = () => {
    setModalState({ type: null, visible: false });
  };

  const handlePlayAgain = () => {
    if (!gameData?.getGame) return;
    const { gameType, aiDifficulty } = gameData.getGame;
    setModalState({ type: null, visible: false });
    setShowCheckMessage(false);
    handleCreateGame(gameType, aiDifficulty);
  };

  const handleMainMenu = () => {
    setModalState({ type: null, visible: false });
    setShowCheckMessage(false);
    setGameId(null);
  };

  const getGameTypeDisplay = () => {
    if (gameData?.getGame?.gameType === 'HUMAN_VS_AI') {
      const difficultyMap = {
        NORMAL: 'Easy',
        HARD: 'Medium',
        IMPOSSIBLE: 'Hard'
      };
      return `Playing against AI (${difficultyMap[gameData.getGame.aiDifficulty] || 'Unknown'})`;
    }
    return 'Local Multiplayer';
  };

  return (
    <div className="container">
      <h1>Chess Game</h1>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>Error: {error}</div>}

      {!gameId ? (
        <div>
          {/* Local Play Section */}
          <div className="section-container">
            <h2>Play Locally</h2>
            <p>Two players on the same device</p>
            <button
              onClick={() => handleCreateGame()}
              className="create-btn"
              disabled={createLoading}
            >
              {createLoading ? 'Creating...' : 'Start Local Game'}
            </button>
          </div>

          {/* AI Play Section */}
          <div className="section-container">
            <h2>Play Against AI</h2>
            <p>Choose your difficulty level:</p>
            <div className="ai-buttons">
              <button 
                className="ai-button"
                onClick={() => handleCreateAIGame('NORMAL')}
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Easy'}
              </button>
              <button 
                className="ai-button"
                onClick={() => handleCreateAIGame('HARD')}
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Medium'}
              </button>
              <button 
                className="ai-button"
                onClick={() => handleCreateAIGame('IMPOSSIBLE')}
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Hard'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {queryLoading ? (
            <p>Loading game...</p>
          ) : (
            <div className="game-info">
              <p>Game Type: {getGameTypeDisplay()}</p>
              <p>Current Player: {gameData?.getGame?.currentPlayer}</p>
              <p>
                White Pieces: {gameData?.getGame?.pieces?.filter(p => p.color === 'WHITE').length} &nbsp;|&nbsp;
                Black Pieces: {gameData?.getGame?.pieces?.filter(p => p.color === 'BLACK').length}
              </p>
              {showCheckMessage && (
                <p style={{ color: 'red', fontWeight: 'bold', fontSize: '18px' }}>
                  ⚠️ {gameData?.getGame?.gameType === 'HUMAN_VS_AI' ? 'Your' : gameData?.getGame?.currentPlayer} King is in Check!
                </p>
              )}
              {gameData?.getGame?.winner && (
                <p><strong>Winner: {gameData.getGame.winner}</strong></p>
              )}

              <div style={{ position: 'relative' }}>
                <ChessBoard
                  game={gameData?.getGame}
                  gameId={gameId}
                  onMoveComplete={handleMoveComplete}
                />

                <div className="button-row">
                  <button onClick={handleMainMenu}>Main Menu</button>
                  <button onClick={handlePlayAgain}>Restart Game</button>
                </div>

                <GameModal
                  type={modalState.type}
                  isVisible={modalState.visible}
                  winner={gameData?.getGame?.winner}
                  onOk={handleModalOk}
                  onPlayAgain={handlePlayAgain}
                  onMainMenu={handleMainMenu}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          text-align: center;
          margin-top: 40px;
        }

        .section-container {
          background-color: #f9f9f9;
          padding: 30px;
          margin: 30px auto;
          max-width: 600px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          border: 2px solid #e9ecef;
        }

        .section-container h2 {
          margin-bottom: 10px;
          color: #495057;
        }

        .section-container p {
          color: #6c757d;
          margin-bottom: 20px;
        }

        .ai-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .ai-button {
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          transition: background-color 0.3s;
          font-weight: 500;
          min-width: 120px;
        }

        .ai-button:disabled {
          background-color: #aaa;
          cursor: not-allowed;
        }

        .ai-button:hover:not(:disabled) {
          background-color: #005bb5;
        }

        .create-btn {
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          transition: background-color 0.3s;
          font-weight: 500;
        }

        .create-btn:disabled {
          background-color: #aaa;
          cursor: not-allowed;
        }

        .create-btn:hover:not(:disabled) {
          background-color: #005bb5;
        }

        .game-info {
          text-align: center;
          font-size: 18px;
          margin-bottom: 30px;
        }

        .button-row {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .button-row button {
          flex: 1;
          max-width: 180px;
          padding: 10px 0;
          font-size: 16px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .button-row button:hover {
          background-color: #005bb5;
        }

        @media (max-width: 768px) {
          .ai-buttons {
            flex-direction: column;
            align-items: center;
          }

          .ai-button {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
    </div>
  );
}