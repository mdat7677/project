if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker зарегистрирован:', registration);
      })
      .catch((error) => {
        console.log('Ошибка регистрации Service Worker:', error);
      });
  });
}

const fullscreenBtn = document.getElementById('fullscreenBtn');
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error('Ошибка при переходе в полноэкранный режим:', err);
    });
  } else {
    document.exitFullscreen();
  }
});
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Выйти из полноэкранного режима';
  } else {
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Полноэкранный режим';
  }
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert("Ваш браузер не поддерживает распознавание речи. Пожалуйста, используйте Chrome или Edge.");
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU';
  recognition.interimResults = false;
  recognition.continuous = true;

  const toggleRecognitionBtn = document.getElementById('toggleRecognitionBtn');
  const sensitivityControl = document.getElementById('sensitivityControl');
  const sensitivitySlider = document.getElementById('sensitivitySlider');
  const sensitivityValue = document.getElementById('sensitivityValue');
  const outputDiv = document.getElementById('output');
  const recognizedText = document.getElementById('recognizedText');
  const copyBtn = document.getElementById('copyBtn');
  const languageToggle = document.getElementById('languageToggle');
  const languageDropdown = document.getElementById('languageDropdown');

  let fullTranscript = "";
  let isRecognizing = false;
  let pauseTimer = null;
  let pauseDuration = 2000;

  sensitivitySlider.addEventListener('input', () => {
    pauseDuration = sensitivitySlider.value * 1000;
    sensitivityValue.textContent = sensitivitySlider.value;
  });

  toggleRecognitionBtn.addEventListener('click', () => {
    if (!isRecognizing) {
      recognition.start();
      isRecognizing = true;
      toggleRecognitionBtn.innerHTML = '<i class="fas fa-pause"></i> Остановить распознавание';
      outputDiv.classList.remove('hidden');
      recognizedText.readOnly = false;
    } else {
      recognition.stop();
      isRecognizing = false;
      toggleRecognitionBtn.innerHTML = '<i class="fas fa-microphone wave-animation"></i> Продолжить распознавание';
    }
  });

  recognition.onresult = (event) => {
    clearTimeout(pauseTimer);
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    let formattedTranscript = transcript;
    if (fullTranscript.endsWith(". ") || fullTranscript.length === 0) {
      formattedTranscript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
    }
    if (!fullTranscript.endsWith(formattedTranscript)) {
      fullTranscript += formattedTranscript + " ";
      recognizedText.value = fullTranscript;
    }
    pauseTimer = setTimeout(() => {
      if (fullTranscript.trim() !== "" && !fullTranscript.endsWith(". ")) {
        fullTranscript = fullTranscript.trim() + ". ";
        recognizedText.value = fullTranscript;
      }
    }, pauseDuration);
  };

  recognition.onerror = (event) => {
    console.error("Ошибка распознавания:", event.error);
    if (isRecognizing) {
      recognition.start();
    }
  };

  recognition.onend = () => {
    if (isRecognizing) {
      recognition.start();
    }
  };

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(recognizedText.value);
  });

  recognizedText.addEventListener('click', () => {
    recognizedText.focus();
  });

  recognizedText.addEventListener('input', () => {
    fullTranscript = recognizedText.value;
  });

  languageToggle.addEventListener('click', () => {
    languageDropdown.classList.toggle('show');
  });

  document.addEventListener('click', (event) => {
    if (!languageToggle.contains(event.target) && !languageDropdown.contains(event.target)) {
      languageDropdown.classList.remove('show');
    }
  });

  document.querySelectorAll('#languageDropdown button').forEach((button) => {
    button.addEventListener('click', () => {
      const lang = button.getAttribute('data-lang');
      recognition.lang = lang;
      languageToggle.querySelector('span').textContent = button.textContent.trim();
      languageDropdown.classList.remove('show');
    });
  });
}
