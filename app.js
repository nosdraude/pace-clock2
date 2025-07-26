let workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
let currentWorkout = 0, currentInterval = 0, currentRep = 0;
let timer = null, isRunning = false;
let timeLeft = 0, currentPhase = '';

const timerDisplay = document.getElementById('timerDisplay');
const phaseDisplay = document.getElementById('phaseDisplay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const workoutList = document.getElementById('workoutList');

// Sounds
const sounds = {
  start: new Audio('assets/sounds/start.mp3'),
  goalEnd: new Audio('assets/sounds/end_goal.mp3'),
  restEnd: new Audio('assets/sounds/end_rest.mp3'),
};

// Preload sounds
Object.values(sounds).forEach(sound => sound.load());

function updateWorkoutList() {
  workoutList.innerHTML = '';
  workouts.forEach((w, i) => {
    const li = document.createElement('li');
    li.innerText = `${w.type.toUpperCase()}: ${w.intervals.map(intv =>
      `${intv.reps}x ${intv.goalTime}s + ${intv.restTime}s rest`).join(', ')}`;
    workoutList.appendChild(li);
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString();
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function setPhase(text) {
  currentPhase = text;
  phaseDisplay.innerText = text;
}

function startTimer(duration, callback) {
  timeLeft = duration;
  timerDisplay.innerText = formatTime(timeLeft);

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timer);
      callback();
    }
  }, 1000);
}

function runWorkout() {
  if (currentWorkout >= workouts.length) {
    setPhase("Finished");
    isRunning = false;
    return;
  }

  const workout = workouts[currentWorkout];
  const intervals = workout.intervals;

  if (currentInterval >= intervals.length) {
    if (workout.restBetweenSets) {
      setPhase("Rest Between Sets");
      sounds.start.play();
      startTimer(workout.restBetweenSets, () => {
        currentWorkout++;
        currentInterval = 0;
        currentRep = 0;
        runWorkout();
      });
    } else {
      currentWorkout++;
      currentInterval = 0;
      currentRep = 0;
      runWorkout();
    }
    return;
  }

  const interval = intervals[currentInterval];

  if (currentRep < interval.reps) {
    setPhase("Goal Time");
    sounds.start.play();
    startTimer(interval.goalTime, () => {
      sounds.goalEnd.play();
      setPhase("Rest Time");
      startTimer(interval.restTime, () => {
        sounds.restEnd.play();
        currentRep++;
        runWorkout();
      });
    });
  } else {
    currentInterval++;
    currentRep = 0;
    runWorkout();
  }
}

startBtn.addEventListener('click', () => {
  if (!isRunning && workouts.length > 0) {
    isRunning = true;
    currentWorkout = 0;
    currentInterval = 0;
    currentRep = 0;
    runWorkout();
  }
});

stopBtn.addEventListener('click', () => {
  clearInterval(timer);
  isRunning = false;
  setPhase("Stopped");
  timerDisplay.innerText = "00:00";
});

document.getElementById('workoutForm').addEventListener('submit', e => {
  e.preventDefault();

  const type = document.getElementById('type').value;
  const reps = parseInt(document.getElementById('reps').value);
  const goalTime = parseInt(document.getElementById('goalTime').value);
  const restTime = parseInt(document.getElementById('restTime').value);
  const restBetweenSets = parseInt(document.getElementById('restBetweenSets').value || 0);

  const workout = {
    type,
    intervals: [{
      reps,
      goalTime,
      restTime
    }],
    restBetweenSets
  };

  workouts.push(workout);
  localStorage.setItem('workouts', JSON.stringify(workouts));
  updateWorkoutList();
  e.target.reset();
});

updateWorkoutList();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
