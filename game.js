// Ship, Captain, and Crew Game
// A dice game where players try to roll 6 (Ship), 5 (Captain), and 4 (Crew)

class ShipCaptainCrew {
    constructor() {
        // Game state
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;
        this.currentPlayer = 'player'; // 'player' or 'computer'
        this.rollsRemaining = 3;
        this.playerDice = [0, 0, 0, 0, 0];
        this.computerDice = [0, 0, 0, 0, 0];
        this.keptDice = [];
        this.selectedIndices = [];
        this.hasShipCaptainCrew = false;
        this.gameOver = false;
        
        // NEW: Track which special dice have been kept
        this.hasShipKept = false; // 6
        this.hasCaptainKept = false; // 5
        this.hasCrewKept = false; // 4
        
        // DOM elements
        this.playerScoreEl = document.getElementById('player-score');
        this.computerScoreEl = document.getElementById('computer-score');
        this.playerTurnScoreEl = document.getElementById('player-turn-score');
        this.computerTurnScoreEl = document.getElementById('computer-turn-score');
        this.gameStatusEl = document.getElementById('game-status');
        this.roundNumberEl = document.getElementById('round-number');
        this.rollsRemainingEl = document.getElementById('rolls-remaining');
        this.rollBtn = document.getElementById('roll-btn');
        this.keepBtn = document.getElementById('keep-btn');
        this.endTurnBtn = document.getElementById('end-turn-btn');
        
        // Player dice elements
        this.playerDiceEls = [];
        for (let i = 0; i < 5; i++) {
            this.playerDiceEls.push(document.getElementById(`player-die-${i}`));
        }
        
        // Computer dice elements
        this.computerDiceEls = [];
        for (let i = 0; i < 5; i++) {
            this.computerDiceEls.push(document.getElementById(`computer-die-${i}`));
        }
        
        // Create confetti container
        this.createConfettiContainer();
        
        // Event listeners
        this.setupEventListeners();
        
        // Initialize game
        this.updateDisplay();
    }
    
    createConfettiContainer() {
        this.confettiContainer = document.createElement('div');
        this.confettiContainer.id = 'confetti-container';
        this.confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
        `;
        document.body.appendChild(this.confettiContainer);
    }
    
    throwConfetti(amount = 10) {
        // Clear existing confetti
        this.confettiContainer.innerHTML = '';
        
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#ff0088'];
        
        for (let i = 0; i < amount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confettiFall ${1 + Math.random() * 2}s linear forwards;
            `;
            this.confettiContainer.appendChild(confetti);
        }
        
        // Add animation if not already present
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            this.confettiContainer.innerHTML = '';
        }, 3000);
    }
    
    setupEventListeners() {
        // Roll button
        this.rollBtn.addEventListener('click', () => this.rollDice());
        
        // Keep button
        this.keepBtn.addEventListener('click', () => this.keepSelectedDice());
        
        // End turn button
        this.endTurnBtn.addEventListener('click', () => this.endTurn());
        
        // Dice selection - only for player's turn
        this.playerDiceEls.forEach((dieEl, index) => {
            dieEl.addEventListener('click', () => {
                if (this.currentPlayer === 'player' && !this.gameOver) {
                    this.toggleDieSelection(index);
                }
            });
        });
    }
    
    toggleDieSelection(index) {
        // Can only select dice that are not already kept
        const dieEl = this.playerDiceEls[index];
        
        if (dieEl.classList.contains('kept')) {
            return; // Already kept, can't deselect
        }
        
        const dieValue = this.playerDice[index];
        
        // NEW RULE: Must have a 6 before you can select and save a 5 or 4
        // You can select a 6 & 5 in one roll, or 6, 5 & 4 in one roll
        if (dieValue === 5 && !this.hasShipKept) {
            // Cannot select 5 without having 6 already kept
            this.gameStatusEl.innerHTML = '<p>You must have a 6 (Ship) before you can select a 5 (Captain)!</p>';
            return;
        }
        
        if (dieValue === 4 && !this.hasShipKept) {
            // Cannot select 4 without having 6 already kept
            this.gameStatusEl.innerHTML = '<p>You must have a 6 (Ship) before you can select a 4 (Crew)!</p>';
            return;
        }
        
        // Toggle selection
        if (this.selectedIndices.includes(index)) {
            this.selectedIndices = this.selectedIndices.filter(i => i !== index);
            dieEl.classList.remove('selected');
        } else {
            this.selectedIndices.push(index);
            dieEl.classList.add('selected');
        }
        
        // Enable/disable keep button based on selection
        this.keepBtn.disabled = this.selectedIndices.length === 0;
    }
    
    rollDice() {
        if (this.gameOver || this.rollsRemaining <= 0) return;
        
        // Disable roll button during animation
        this.rollBtn.disabled = true;
        
        // Add rolling animation
        if (this.currentPlayer === 'player') {
            this.playerDiceEls.forEach(el => {
                if (!el.classList.contains('kept')) {
                    el.classList.add('rolling');
                    el.textContent = '?';
                }
            });
        } else {
            this.computerDiceEls.forEach(el => {
                if (!el.classList.contains('kept')) {
                    el.classList.add('rolling');
                    el.textContent = '?';
                }
            });
        }
        
        // Simulate rolling animation
        setTimeout(() => {
            if (this.currentPlayer === 'player') {
                this.rollPlayerDice();
            } else {
                this.rollComputerDice();
            }
            
            // Remove rolling class
            document.querySelectorAll('.dice.rolling').forEach(el => {
                el.classList.remove('rolling');
            });
            
            this.rollBtn.disabled = false;
        }, 1000);
    }
    
    rollPlayerDice() {
        // Roll only the dice that are not kept
        for (let i = 0; i < 5; i++) {
            if (!this.playerDiceEls[i].classList.contains('kept')) {
                this.playerDice[i] = this.rollSingleDie();
            }
        }
        
        this.rollsRemaining--;
        this.updateDisplay();
        
        // Check if player has ship, captain, crew
        this.checkShipCaptainCrew('player');
        
        // If no rolls remaining or has ship/captain/crew, enable end turn
        if (this.rollsRemaining <= 0 || this.hasShipCaptainCrew) {
            this.endTurnBtn.disabled = false;
        }
        
        // If has ship/captain/crew, auto-end turn after a delay
        if (this.hasShipCaptainCrew) {
            setTimeout(() => {
                if (this.currentPlayer === 'player' && this.hasShipCaptainCrew) {
                    this.endTurn();
                }
            }, 1500);
        }
    }
    
    rollComputerDice() {
        // Computer AI: decide which dice to keep
        if (this.rollsRemaining === 2) {
            // First roll - keep ship, captain, crew if present (following the same rules)
            this.computerSelectDice();
        }
        
        // Roll only the dice that are not kept
        for (let i = 0; i < 5; i++) {
            if (!this.computerDiceEls[i].classList.contains('kept')) {
                this.computerDice[i] = this.rollSingleDie();
            }
        }
        
        this.rollsRemaining--;
        this.updateDisplay();
        
        // Check if computer has ship, captain, crew
        this.checkShipCaptainCrew('computer');
        
        // Computer AI: decide whether to keep more dice or end turn
        if (this.rollsRemaining > 0 && !this.hasShipCaptainCrew) {
            // Computer will always try to keep more dice if it doesn't have ship/captain/crew
            setTimeout(() => {
                this.computerSelectDice();
                if (this.rollsRemaining > 0) {
                    this.rollDice(); // Continue rolling
                }
            }, 1000);
        } else if (this.rollsRemaining <= 0 || this.hasShipCaptainCrew) {
            // End computer's turn
            setTimeout(() => {
                this.endTurn();
            }, 1500);
        }
    }
    
    computerSelectDice() {
        // Computer AI logic to select which dice to keep (following the same rules)
        const dice = this.computerDice;
        const keptIndices = [];
        
        // Check what the computer currently has kept
        const computerHasShip = this.computerDiceEls.some(el => 
            el.classList.contains('kept') && el.classList.contains('ship')
        );
        const computerHasCaptain = this.computerDiceEls.some(el => 
            el.classList.contains('kept') && el.classList.contains('captain')
        );
        const computerHasCrew = this.computerDiceEls.some(el => 
            el.classList.contains('kept') && el.classList.contains('crew')
        );
        
        // Always keep ship (6) first - this is always allowed
        for (let i = 0; i < 5; i++) {
            if (!this.computerDiceEls[i].classList.contains('kept')) {
                if (dice[i] === 6) {
                    keptIndices.push(i);
                }
            }
        }
        
        // Only keep captain (5) or crew (4) if we already have ship (6) kept
        const canKeepCaptainAndCrew = computerHasShip || keptIndices.some(i => dice[i] === 6);
        
        if (canKeepCaptainAndCrew) {
            for (let i = 0; i < 5; i++) {
                if (!this.computerDiceEls[i].classList.contains('kept')) {
                    if (dice[i] === 5) {
                        keptIndices.push(i);
                    } else if (dice[i] === 4) {
                        keptIndices.push(i);
                    }
                }
            }
        }
        
        // If we have ship, captain, crew, we're done
        if ((computerHasShip || keptIndices.some(i => dice[i] === 6)) &&
            (computerHasCaptain || keptIndices.some(i => dice[i] === 5)) &&
            (computerHasCrew || keptIndices.some(i => dice[i] === 4))) {
            // Keep all ship, captain, crew
            this.keepComputerDice(keptIndices);
            return;
        }
        
        // If we have two of ship, captain, crew, keep them
        const hasTwo = (computerHasShip || keptIndices.some(i => dice[i] === 6)) +
                       (computerHasCaptain || keptIndices.some(i => dice[i] === 5)) +
                       (computerHasCrew || keptIndices.some(i => dice[i] === 4)) >= 2;
        
        if (hasTwo && keptIndices.length > 0) {
            this.keepComputerDice(keptIndices);
            return;
        }
        
        // If we have ship (6) alone, keep it
        if ((computerHasShip || keptIndices.some(i => dice[i] === 6)) && keptIndices.length > 0) {
            this.keepComputerDice(keptIndices);
            return;
        }
        
        // If we have high numbers (3+), keep them for potential score
        const highDiceIndices = [];
        for (let i = 0; i < 5; i++) {
            if (!this.computerDiceEls[i].classList.contains('kept') && dice[i] >= 3) {
                highDiceIndices.push(i);
            }
        }
        
        if (highDiceIndices.length > 0) {
            this.keepComputerDice(highDiceIndices);
        }
    }
    
    keepComputerDice(indices) {
        // Mark computer dice as kept
        let specialCount = 0;
        
        indices.forEach(index => {
            this.computerDiceEls[index].classList.add('kept');
            
            // Track which special dice are kept
            if (this.computerDice[index] === 6) {
                this.hasShipKept = true;
                this.computerDiceEls[index].classList.add('ship');
                specialCount++;
            } else if (this.computerDice[index] === 5) {
                this.hasCaptainKept = true;
                this.computerDiceEls[index].classList.add('captain');
                specialCount++;
            } else if (this.computerDice[index] === 4) {
                this.hasCrewKept = true;
                this.computerDiceEls[index].classList.add('crew');
                specialCount++;
            }
        });
        
        // Throw confetti based on number of special dice kept
        if (specialCount > 0) {
            this.throwConfetti(specialCount * 15); // More confetti for more special dice
        }
    }
    
    keepSelectedDice() {
        if (this.selectedIndices.length === 0 || this.currentPlayer !== 'player') return;
        
        // Mark selected dice as kept
        let specialCount = 0;
        
        this.selectedIndices.forEach(index => {
            this.playerDiceEls[index].classList.add('kept');
            this.playerDiceEls[index].classList.remove('selected');
            
            // Track which special dice are kept
            if (this.playerDice[index] === 6) {
                this.hasShipKept = true;
                this.playerDiceEls[index].classList.add('ship');
                specialCount++;
            } else if (this.playerDice[index] === 5) {
                this.hasCaptainKept = true;
                this.playerDiceEls[index].classList.add('captain');
                specialCount++;
            } else if (this.playerDice[index] === 4) {
                this.hasCrewKept = true;
                this.playerDiceEls[index].classList.add('crew');
                specialCount++;
            }
        });
        
        // Throw confetti based on number of special dice kept
        if (specialCount > 0) {
            this.throwConfetti(specialCount * 15); // More confetti for more special dice
        }
        
        // Clear selection
        this.selectedIndices = [];
        this.keepBtn.disabled = true;
        
        // Check if player has ship, captain, crew
        this.checkShipCaptainCrew('player');
        
        // If has ship/captain/crew, enable end turn
        if (this.hasShipCaptainCrew) {
            this.endTurnBtn.disabled = false;
        }
    }
    
    checkShipCaptainCrew(player) {
        const dice = player === 'player' ? this.playerDice : this.computerDice;
        const diceEls = player === 'player' ? this.playerDiceEls : this.computerDiceEls;
        
        const hasShip = dice.some((val, idx) => val === 6 && diceEls[idx].classList.contains('kept'));
        const hasCaptain = dice.some((val, idx) => val === 5 && diceEls[idx].classList.contains('kept'));
        const hasCrew = dice.some((val, idx) => val === 4 && diceEls[idx].classList.contains('kept'));
        
        this.hasShipCaptainCrew = hasShip && hasCaptain && hasCrew;
        
        // Update tracking for current player
        if (player === 'player') {
            this.hasShipKept = hasShip;
            this.hasCaptainKept = hasCaptain;
            this.hasCrewKept = hasCrew;
        } else {
            // For computer, update separate tracking if needed
        }
        
        // Highlight the ship, captain, crew dice
        if (this.hasShipCaptainCrew) {
            diceEls.forEach((el, idx) => {
                if (dice[idx] === 6 && el.classList.contains('kept')) {
                    el.classList.add('ship', 'special');
                } else if (dice[idx] === 5 && el.classList.contains('kept')) {
                    el.classList.add('captain', 'special');
                } else if (dice[idx] === 4 && el.classList.contains('kept')) {
                    el.classList.add('crew', 'special');
                }
            });
        }
    }
    
    endTurn() {
        if (this.gameOver) return;
        
        let turnScore = 0;
        
        if (this.currentPlayer === 'player') {
            // Calculate player's turn score
            if (this.hasShipCaptainCrew) {
                // Sum ALL five dice (rule change: leaving two more rolls for highest total of all five dice)
                this.playerDice.forEach(val => {
                    turnScore += val;
                });
                this.playerScore += turnScore;
                this.playerTurnScoreEl.textContent = turnScore;
            } else {
                // No ship, captain, crew - score 0
                this.playerTurnScoreEl.textContent = '0';
            }
            
            // Switch to computer
            this.currentPlayer = 'computer';
            this.gameStatusEl.innerHTML = '<p>Computer\'s turn...</p>';
            
            // Reset computer dice
            this.computerDice = [0, 0, 0, 0, 0];
            this.computerDiceEls.forEach(el => {
                el.classList.remove('kept', 'ship', 'captain', 'crew', 'special');
                el.textContent = '?';
            });
            
            // Reset state for computer's turn
            this.rollsRemaining = 3;
            this.hasShipCaptainCrew = false;
            this.hasShipKept = false;
            this.hasCaptainKept = false;
            this.hasCrewKept = false;
            this.computerTurnScoreEl.textContent = '0';
            
            // Computer takes its turn
            setTimeout(() => {
                this.rollDice();
            }, 1000);
            
        } else {
            // Calculate computer's turn score
            if (this.hasShipCaptainCrew) {
                // Sum ALL five dice (rule change)
                this.computerDice.forEach(val => {
                    turnScore += val;
                });
                this.computerScore += turnScore;
                this.computerTurnScoreEl.textContent = turnScore;
            } else {
                // No ship, captain, crew - score 0
                this.computerTurnScoreEl.textContent = '0';
            }
            
            // Switch back to player for next round
            this.currentPlayer = 'player';
            this.currentRound++;
            
            // Check for game over (after 5 rounds)
            if (this.currentRound > 5) {
                this.endGame();
                return;
            }
            
            // Reset for next round
            this.gameStatusEl.innerHTML = `<p>Your turn! Click "Roll Dice" to start Round ${this.currentRound}.</p>`;
            
            // Reset player dice
            this.playerDice = [0, 0, 0, 0, 0];
            this.playerDiceEls.forEach(el => {
                el.classList.remove('kept', 'selected', 'ship', 'captain', 'crew', 'special');
                el.textContent = '?';
            });
            
            // Reset state
            this.selectedIndices = [];
            this.rollsRemaining = 3;
            this.hasShipCaptainCrew = false;
            this.hasShipKept = false;
            this.hasCaptainKept = false;
            this.hasCrewKept = false;
            this.playerTurnScoreEl.textContent = '0';
        }
        
        // Update buttons
        this.rollBtn.disabled = this.currentPlayer !== 'player';
        this.keepBtn.disabled = true;
        this.endTurnBtn.disabled = true;
        
        this.updateDisplay();
    }
    
    endGame() {
        this.gameOver = true;
        
        let winner = '';
        if (this.playerScore > this.computerScore) {
            winner = 'You win!';
        } else if (this.computerScore > this.playerScore) {
            winner = 'Computer wins!';
        } else {
            winner = 'It\'s a tie!';
        }
        
        // Create game over overlay
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>Game Over!</h2>
            <p>${winner}</p>
            <p>Final Score: You ${this.playerScore} - ${this.computerScore} Computer</p>
            <button id="play-again-btn" class="btn">Play Again</button>
        `;
        
        document.body.appendChild(gameOverDiv);
        
        // Play again button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            gameOverDiv.remove();
            this.resetGame();
        });
    }
    
    resetGame() {
        // Reset all game state
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;
        this.currentPlayer = 'player';
        this.rollsRemaining = 3;
        this.playerDice = [0, 0, 0, 0, 0];
        this.computerDice = [0, 0, 0, 0, 0];
        this.keptDice = [];
        this.selectedIndices = [];
        this.hasShipCaptainCrew = false;
        this.hasShipKept = false;
        this.hasCaptainKept = false;
        this.hasCrewKept = false;
        this.gameOver = false;
        
        // Reset all dice elements
        this.playerDiceEls.forEach(el => {
            el.classList.remove('kept', 'selected', 'ship', 'captain', 'crew', 'special');
            el.textContent = '?';
        });
        
        this.computerDiceEls.forEach(el => {
            el.classList.remove('kept', 'selected', 'ship', 'captain', 'crew', 'special');
            el.textContent = '?';
        });
        
        // Reset buttons
        this.rollBtn.disabled = false;
        this.keepBtn.disabled = true;
        this.endTurnBtn.disabled = true;
        
        // Update display
        this.updateDisplay();
        this.gameStatusEl.innerHTML = '<p>Your turn! Click "Roll Dice" to start.</p>';
    }
    
    rollSingleDie() {
        return Math.floor(Math.random() * 6) + 1;
    }
    
    updateDisplay() {
        // Update scores
        this.playerScoreEl.textContent = this.playerScore;
        this.computerScoreEl.textContent = this.computerScore;
        
        // Update round info
        this.roundNumberEl.textContent = this.currentRound;
        this.rollsRemainingEl.textContent = this.rollsRemaining;
        
        // Update dice displays
        this.playerDice.forEach((val, idx) => {
            if (!this.playerDiceEls[idx].classList.contains('kept')) {
                this.playerDiceEls[idx].textContent = val === 0 ? '?' : val;
            }
        });
        
        this.computerDice.forEach((val, idx) => {
            if (!this.computerDiceEls[idx].classList.contains('kept')) {
                this.computerDiceEls[idx].textContent = val === 0 ? '?' : val;
            }
        });
        
        // Update button states based on current player
        this.rollBtn.disabled = this.currentPlayer !== 'player' || this.gameOver;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ShipCaptainCrew();
});
