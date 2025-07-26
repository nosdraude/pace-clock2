let workouts = [];
let currentIndex = 0;
let currentRep = 0;
let timer;
let timeLeft = 0;
let isRunning = false;

const timerEl = document.getElementById('timer');
const phaseEl = document.getElementById('phase');
const statusEl = document.getElementById('workoutStatus');
const workoutsEl = document.getElementById('workouts');

const startSound = new Audio('start.mp3');
const goalSound = new Audio('end_goal.mp3');
const restSound = new Audio('end_rest.mp3');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateDisplay(phase, workoutType, rep) {
  phaseEl.textContent = `Phase: ${phase}`;
  statusEl.textContent = `Workout: ${workoutType}, Rep: ${rep}`;
}

function addWorkout() {
  const type = document.getElementById('type').value;
  const reps = parseInt(document.getElementById('reps').value);
  const goal = parseInt(document.getElementById('goal').value);
  const rest = parseInt(document.getElementById('rest').value);
  const setRest = parseInt(document.getElementById('setRest').value || 0);

  if (!reps || !goal || !rest) return alert('Please fill all fields.');

  workouts.push({ type, reps, goal, rest, setRest });
  renderWorkouts();
}

function renderWorkouts() {
  workoutsEl.innerHTML = '';
  workouts.forEach((w, i) => {
    const li = document.createElement('li');
    li.textContent = `${w.type} - ${w.reps} x ${w.goal}s + ${w.rest}s rest`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '❌';
    removeBtn.onclick = () => {
      workouts.splice(i, 1);
      renderWorkouts();
    };
    li.appendChild(removeBtn);
    workoutsEl.appendChild(li);
  });
}

function start() {
  if (isRunning || workouts.length === 0) return;
  isRunning = true;
  currentIndex = 0;
  currentRep = 0;
  runWorkout();
}

function runWorkout() {
  if (currentIndex >= workouts.length) {
    updateDisplay('Finished', '-', '-');
    timerEl.textContent = '00:00';
    isRunning = false;
    return;
  }

  const currentWorkout = workouts[currentIndex];

  if (currentRep >= currentWorkout.reps) {
    if (currentWorkout.setRest > 0) {
      updateDisplay('Rest Between Sets', currentWorkout.type, '-');
      playSound(startSound);
      countdown(currentWorkout.setRest, () => {
        currentIndex++;
        currentRep = 0;
        runWorkout();
      });
    } else {
      currentIndex++;
      currentRep = 0;
      runWorkout();
    }
    return;
  }

  updateDisplay('Goal Time', currentWorkout.type, currentRep + 1);
  playSound(startSound);
  countdown(currentWorkout.goal, () => {
    playSound(goalSound);
    updateDisplay('Rest Time', currentWorkout.type, currentRep + 1);
    countdown(currentWorkout.rest, () => {
      playSound(restSound);
      currentRep++;
      runWorkout();
    });
  });
}

function countdown(duration, callback) {
  clearInterval(timer);
  timeLeft = duration;
  timerEl.textContent = formatTime(timeLeft);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timer);
      callback();
    }
  }, 1000);
}

function stop() {
  clearInterval(timer);
  isRunning = false;
  updateDisplay('Stopped', '-', '-');
  timerEl.textContent = '00:00';
}

function reset() {
  stop();
  workouts = [];
  currentIndex = 0;
  currentRep = 0;
  renderWorkouts();
}

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
