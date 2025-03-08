document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.portfolio-grid');
    const filters = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');

    // Filter functionality
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            const category = filter.dataset.filter;

            items.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeUp 0.8s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Stagger animation on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = `${index * 0.1}s`;
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    items.forEach(item => observer.observe(item));
});
document.addEventListener('DOMContentLoaded', () => {
    const checkBattery = async () => {
        try {
            const battery = await navigator.getBattery();
            const batteryWarning = document.getElementById('batteryWarning');
            const batteryLevel = document.getElementById('batteryLevel');
            
            const updateBatteryStatus = () => {
                const level = Math.floor(battery.level * 100);
                batteryLevel.textContent = `${level}%`;
                
                if (level <= 15) {
                    batteryWarning.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            };

            battery.addEventListener('levelchange', updateBatteryStatus);
            updateBatteryStatus();
            
        } catch (error) {
            console.log('Battery status not supported');
        }
    };

    checkBattery();
});
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// API setup
const API_KEY = "AIzaSyD5FAp_HaPZbFrhPaJy08UFlYn7Aq28Uto";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Initialize user message and file data
const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

// Store chat history
// Line 24
const chatHistory = [
    {
      role: "model",
      parts: [{ text: `JT-Shots is a photography website. It's a free platform for users to view amazing photos of different locations. We're here to help you find the perfect place to capture your best moments. JT-Shots was invented by Joey Tanner. The homepage URL is: https://jtanner.co.uk and the photos URL is: https://jtanner.co.uk/photos. Visit our help centre at https://jtanner.co.uk/help-centre.` }],
    },
  ];
const initialInputHeight = messageInput.scrollHeight;

// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Generate bot response using API
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

// Line 40
chatHistory.push({
    role: "user",
    parts: [{ text: `Using the details provided above, please address this query: ${userData.message}` }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])],
  });

  // API request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: chatHistory,
    }),
  };

  try {
    // Fetch bot response from API
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Extract and display bot's response text
    const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
    messageElement.innerText = apiResponseText;

    // Add bot response to chat history
    chatHistory.push({
      role: "model",
      parts: [{ text: apiResponseText }],
    });
  } catch (error) {
    // Handle error in API response
    console.log(error);
    messageElement.innerText = error.message;
    messageElement.style.color = "#ff0000";
  } finally {
    // Reset user's file data, removing thinking indicator and scroll chat to bottom
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  fileUploadWrapper.classList.remove("file-uploaded");

  // Create and display user message
  const messageContent = `<div class="message-text"></div>
                          ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // Simulate bot response with thinking indicator after a delay
  setTimeout(() => {
    const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path
              d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/></svg>
          <div class="message-text">
            <div class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;

    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// Handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && !e.shiftKey && userMessage && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

// Handle file input change and preview the selected file
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    // Store file data in userData
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
  };

  reader.readAsDataURL(file);
});

// Cancel file upload
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded");
});

// Initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
  theme: "dark",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
  onClickOutside: (e) => {
    if (e.target.id === "emoji-picker") {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  },
});

document.querySelector(".chat-form").appendChild(picker);

sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
// Sample project data (in a real-world scenario, this would come from a backend)
const projects = [
  { 
      id: 1, 
      title: 'Help - Project Does Not Load', 
      category: 'Help',
      url: 'help-centre-project-does-not-load.html'
  },
  { 
      id: 2, 
      title: 'Help -', 
      category: 'Portrait',
      url: 'project-portraits.html'
  },
  { 
      id: 3, 
      title: 'Wedding Photography', 
      category: 'Event',
      url: 'project-wedding.html'
  },
  { 
      id: 4, 
      title: 'Nature Macro', 
      category: 'Landscape',
      url: 'project-macro.html'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const autocompleteList = document.getElementById('autocomplete-list');

  // Debounce function to limit search frequency
  function debounce(func, delay) {
      let timeoutId;
      return function() {
          const context = this;
          const args = arguments;
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
              func.apply(context, args);
          }, delay);
      };
  }

  // Search and autocomplete function
  function searchProjects(query) {
      // Clear previous results
      autocompleteList.innerHTML = '';

      // If query is empty, return
      if (!query) return;

      // Filter projects based on query
      const filteredProjects = projects.filter(project => 
          project.title.toLowerCase().includes(query.toLowerCase()) || 
          project.category.toLowerCase().includes(query.toLowerCase())
      );

      // Create autocomplete suggestions
      filteredProjects.forEach(project => {
          const li = document.createElement('li');
          li.textContent = project.title;
          li.addEventListener('click', () => {
              // Redirect to project page
              window.location.href = project.url;
          });
          autocompleteList.appendChild(li);
      });
  }

  // Debounced search function
  const debouncedSearch = debounce(searchProjects, 300);

  // Event listener for search input
  searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
  });

  // Close autocomplete list when clicking outside
  document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
          autocompleteList.innerHTML = '';
      }
  });

  // Keyboard navigation for autocomplete
  searchInput.addEventListener('keydown', (e) => {
      const items = autocompleteList.getElementsByTagName('li');
      
      if (e.key === 'ArrowDown') {
          e.preventDefault();
          focusNextItem(items, 1);
      } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusNextItem(items, -1);
      } else if (e.key === 'Enter') {
          const activeItem = autocompleteList.querySelector('.autocomplete-active');
          if (activeItem) {
              activeItem.click();
          }
      }
  });

  // Helper function to navigate through autocomplete items
  function focusNextItem(items, direction) {
      let currentIndex = Array.from(items).findIndex(item => 
          item.classList.contains('autocomplete-active')
      );

      // Remove previous active class
      if (currentIndex !== -1) {
          items[currentIndex].classList.remove('autocomplete-active');
      }

      // Calculate new index
      currentIndex = (currentIndex + direction + items.length) % items.length;

      // Add active class to new item
      items[currentIndex].classList.add('autocomplete-active');
  }
});