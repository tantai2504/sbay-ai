
(function(){
    $('#msbo').on('click', function(){
      $('body').toggleClass('msb-x');
      $(this).find('i').toggleClass('fa-angle-left fa-angle-right');
    });
  }());

  // SbayAI
(function () {
  let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
  let isWindow = true;
  let isDebugMode = true;
  let isFullscreen = true;
  let isCasuallyFineTuned = false;
  let textCompliance = '';
  let rawUserName = 'User: ';
  let rawAiName = 'SbayAI: ';
  let mode = 'chat';
  let model = 'gpt-3.5-turbo';
  let context = isCasuallyFineTuned ? null : 'Xin chào! Em có thể giúp gì anh chị?';
  let embeddingsIndex = '';
  let startSentence = 'Xin chào! Em có thể giúp gì anh chị?';
  let maxSentences = 10;
  let memorizeChat = false;
  let maxTokens = 1024;
  let temperature = 0.8;
  let memorizedChat = [];
  let typewriter = false;

  let contents_data = [];

  if (isDebugMode) {
      window.mwai_6406ca505bbf2 = {
          memorizedChat: memorizedChat,
          parameters: {
              mode: mode, model, temperature, maxTokens, context: context, startSentence,
              textCompliance, isMobile, isWindow, isFullscreen, isCasuallyFineTuned, memorizeChat, maxSentences,
              rawUserName, rawAiName, embeddingsIndex, typewriter
          }
      };
  }

  // Set button text
  function setButtonText() {
      let input = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-input textarea');
      let button = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-input button');
      let buttonSpan = button.querySelector('span');
      if (memorizedChat.length < 2) {
          buttonSpan.innerHTML = 'Gửi';
      }
      else if (!input.value.length) {
          button.classList.add('mwai-clear');
          buttonSpan.innerHTML = 'Xoá';
      }
      else {
          button.classList.remove('mwai-clear');
          buttonSpan.innerHTML = 'Gửi';
      }
  }

  // Inject timer 
  function injectTimer(element) {
      let intervalId;
      let startTime = new Date();
      let timerElement = null;

      function updateTimer() {
          let now = new Date();
          let timer = Math.floor((now - startTime) / 1000);
          if (!timerElement) {
              if (timer > 0.5) {
                  timerElement = document.createElement('div');
                  timerElement.classList.add('mwai-timer');
                  element.appendChild(timerElement);
              }
          }
          if (timerElement) {
              let minutes = Math.floor(timer / 60);
              let seconds = timer - (minutes * 60);
              seconds = seconds < 10 ? "0" + seconds : seconds;
              let display = minutes + ":" + seconds;
              timerElement.innerHTML = display;
          }
      }

      intervalId = setInterval(updateTimer, 500);

      return function stopTimer() {
          clearInterval(intervalId);
          if (timerElement) {
              timerElement.remove();
          }
      };
  }

  // Push the reply in the conversation
  function addReply(text, role = 'user', replay = false) {
      var conversation = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-conversation');

      if (memorizeChat) {
          localStorage.setItem('mwai-chat-6406ca505bbf2', JSON.stringify(memorizedChat));
      }

      // If text is array, then it's image URLs. Let's create a simple gallery in HTML in $text.
      if (Array.isArray(text)) {
          var newText = '<div class="mwai-gallery">';
          for (var i = 0; i < text.length; i++) {
              newText += '<a href="' + text[i] + '" target="_blank"><img src="' + text[i] + '" />';
          }
          text = newText + '</div>';
      }

      var mwaiClasses = ['mwai-reply'];
      if (role === 'assistant') {
          mwaiClasses.push('mwai-ai');
      }
      else if (role === 'system') {
          mwaiClasses.push('mwai-system');
      }
      else {
          mwaiClasses.push('mwai-user');
      }
      var div = document.createElement('div');
      div.classList.add(...mwaiClasses);
      var nameSpan = document.createElement('span');
      nameSpan.classList.add('mwai-name');
      if (role === 'assistant') {
          nameSpan.innerHTML = '<div class="mwai-name-text">SbayAI:</div>';
      }
      else if (role === 'system') {
          nameSpan.innerHTML = 'System:';
      }
      else {
          nameSpan.innerHTML = '<div class="mwai-name-text">User:</div>';
      }
      var textSpan = document.createElement('div');
      textSpan.classList.add('mwai-text');
      textSpan.innerHTML = text;
      div.appendChild(nameSpan);
      div.appendChild(textSpan);
      conversation.appendChild(div);

      if (typewriter) {
          if (role === 'assistant' && text !== startSentence && !replay) {
              let typewriter = new Typewriter(textSpan, {
                  loop: true,
                  deleteSpeed: 50,
                  delay: 25,
                  loop: false,
                  cursor: '',
                  autoStart: true,
                  wrapperClassName: 'mwai-typewriter',
              });
              typewriter.typeString(text).start().callFunction((state) => {
                  state.elements.cursor.setAttribute('hidden', 'hidden');
                  typewriter.stop();
              });
          }
      }

      conversation.scrollTop = conversation.scrollHeight;
      setButtonText();

      // Syntax coloring
      if (typeof hljs !== 'undefined') {
          document.querySelectorAll('pre code').forEach((el) => {
              hljs.highlightElement(el);
          });
      }
  }

  function buildPrompt(last = 15) {
      let prompt = context ? (context + '\n\n') : '';
      memorizedChat = memorizedChat.slice(-last);

      // Casually fine tuned, let's use the last question
      if (isCasuallyFineTuned) {
          let lastLine = memorizedChat[memorizedChat.length - 1];
          prompt = lastLine.content + ''
          return prompt;
      }

      // Otherwise let's compile the latest conversation
      let conversation = memorizedChat.map(x => x.who + x.content);
      prompt += conversation.join('\n');
      prompt += '\n' + rawAiName;
      return prompt;
  }

  // Function to request the completion
  function onSendClick() {
      let input = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-input textarea');
      let inputText = input.value.trim();

      // Reset the conversation if empty
      if (inputText === '') {
          document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-conversation').innerHTML = '';
          localStorage.removeItem('mwai-chat-6406ca505bbf2');
          memorizedChat = [];
          contents_data = [];
          memorizedChat.push({ role: 'assistant', content: startSentence, who: rawAiName, html: startSentence });
          addReply(startSentence, 'assistant');
          return;
      }

      // Disable the button
      var button = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-input button');
      button.disabled = true;

      // Add the user reply
      memorizedChat.push({ role: 'user', content: inputText, who: rawUserName, html: inputText });
      addReply(inputText, 'user');
      input.value = '';
      input.setAttribute('rows', 1);
      input.disabled = true;

      let prompt = buildPrompt(maxSentences);
      // Prompt for the images
      const data_old = mode === 'images' ? {
          env: 'chatbot',
          id: '4ff7151d-7fb4-4209-900f-c2843addda56',
          session: 'N/A',
          prompt: inputText,
          rawInput: inputText,
          maxResults: 1,
          model: model,
          apiKey: '',
          // Prompt for the chat
      } : {
          env: 'chatbot',
          id: '4ff7151d-7fb4-4209-900f-c2843addda56',
          session: 'N/A',
          prompt: prompt,
          context: context,
          messages: memorizedChat,
          rawInput: inputText,
          userName: '<div class="mwai-name-text">User:</div>',
          aiName: '<div class="mwai-name-text">SbayAI:</div>',
          model: model,
          temperature: temperature,
          maxTokens: maxTokens,
          embeddingsIndex: embeddingsIndex,
          stop: '',
          maxResults: 1,
          apiKey: '',
      };

      // Start the timer
      const stopTimer = injectTimer(button);
      add_question_data_to_history('user', {
          "text": inputText
      });
      var data = {
          contents: contents_data
      };
      // Send the request
      if (isDebugMode) {
          console.log('[BOT] Sent: ', data);
      }

      let ai_api = 'https://ai.sbaygroup.net/api/v1/query';
      fetch( ai_api, {
          method: 'POST', headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': '1637a74fd5'
          },
          body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
          if (isDebugMode) {
              console.log('[BOT] Recv: ', data);
          }
          if (!data.is_ok) {
              console.error('Error fetching data:', data);
              addReply('Đã xảy ra lỗi khi gửi yêu cầu.', 'system');
              // addReply(data.message, 'system');
          }
          else {
              // myObj.s.replace(/\n/g,"<br>")unescape
              // let html = data.answer.replace("\\n","<br>").replace('\"', '').replace('"', '');
              let html = data.answer.replaceAll("\\\n", "<br/>").replaceAll("\\n", "<br/>").replaceAll('\"', "").replaceAll('"', '');
              
              var html_text = '';
              if(data.answer.includes('|\\n|')){
                  var data_answer = data.answer;
                  data_answer = data_answer.replaceAll('\\n\"', '');
                  var html_arr = data_answer.split('\\n\\n');
                  for(var i=0; i<html_arr.length; i++){
                      var current_row = html_arr[i];
                      current_row = current_row.replace(/^\|+|\|+$/g, '');
                      if(current_row.includes('|\\n|')){
                          if(html_text == ''){
                              html_text = '<table>';
                          }else{
                              html_text = html_text + '<br/><table>';
                          }
                          var current_row_arr = current_row.split('|\\n|');
                          for(var j=0; j<current_row_arr.length; j++){
                              html_text = html_text + '<tr>';
                              if(current_row_arr[j].includes('|')){
                                  var current_cell_arr = current_row_arr[j].split('|');
                                  for(var k=0; k<current_cell_arr.length; k++){
                                      var current_cell_value = current_cell_arr[k];
                                      if(current_cell_value == '---'){
                                          current_cell_value = '';
                                      }
                                      html_text = html_text + '<td>' + current_cell_value +'</td>';
                                  }
                              }
                              html_text = html_text + '</tr>';
                          }
                          html_text = html_text + '</table>';
                      }else{
                          current_row = current_row.replaceAll('\\n', '<br/>');
                          if(html_text == ''){
                              html_text = current_row;
                          }else{
                              html_text = html_text + '<br/>' + current_row;
                          }
                      }
                  }
                  html = html_text;
              }

              //   html = data.choices[0].message.content;
              //   data.answer = html;
              memorizedChat.push({ role: 'assistant', content: data.answer, who: rawAiName, html: html });
              add_question_data_to_history('model', {
                  "text": data.answer
              });
              addReply(html, 'assistant');
          }
          button.disabled = false;
          input.disabled = false;
          stopTimer();

          // Only focus only on desktop (to avoid the mobile keyboard to kick-in)
          if (!isMobile) {
              input.focus();
          }
      })
      .catch(error => {
          // console.error(error);
          // button.disabled = false;
          // input.disabled = false;
          // stopTimer();

          console.error('Error fetching data:', error);
          addReply('Đã xảy ra lỗi khi gửi yêu cầu.', 'system');
          button.disabled = false;
          input.disabled = false;
          stopTimer();
      });
      return false;
      
      let apinew = 'https://chatgpt.sbaygroup.com/chatgpt.php';
      fetch( apinew, {
          method: 'POST', headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': '1637a74fd5'
          },
          body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
          if (isDebugMode) {
              console.log('[BOT] Recv: ', data);
          }
          if (!data.success) {
              addReply(data.message, 'system');
          }
          else {
              let html = data.images ? data.images : data.html;
              //   html = data.choices[0].message.content;
              //   data.answer = html;
              memorizedChat.push({ role: 'assistant', content: data.answer, who: rawAiName, html: html });
              addReply(html, 'assistant');
          }
          button.disabled = false;
          input.disabled = false;
          stopTimer();

          // Only focus only on desktop (to avoid the mobile keyboard to kick-in)
          if (!isMobile) {
              input.focus();
          }
      })
      .catch(error => {
          // console.error(error);
          // button.disabled = false;
          // input.disabled = false;
          // stopTimer();

          console.error('Error fetching data:', error);
          addReply('Đã xảy ra lỗi khi gửi yêu cầu.', 'system');
          button.disabled = false;
          input.disabled = false;
          stopTimer();
      });
  }

  // Keep the textarea height in sync with the content
  function resizeTextArea(ev) {
      ev.target.style.height = '100px'; // Đặt chiều cao mong muốn ở đây (ví dụ: 100px)
  }

  // Keep the textarea height in sync with the content
  function delayedResizeTextArea(ev) {
      window.setTimeout(resizeTextArea, 0, event);
  }

  // Init the chatbot
  function mwai_6406ca505bbf2_initChatBot() {
      var input = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-input textarea');
      var button = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-input button');

      input.addEventListener('keypress', (event) => {
          let text = event.target.value;
          if (event.keyCode === 13 && !text.length && !event.shiftKey) {
              event.preventDefault();
              return;
          }
          if (event.keyCode === 13 && text.length && !event.shiftKey) {
              onSendClick();
          }
      });
      input.addEventListener('keydown', (event) => {
          var rows = input.getAttribute('rows');
          if (event.keyCode === 13 && event.shiftKey) {
              var lines = input.value.split('\n').length + 1;
              //mwaiSetTextAreaHeight(input, lines);
          }
      });
      input.addEventListener('keyup', (event) => {
          var rows = input.getAttribute('rows');
          var lines = input.value.split('\n').length;
          //mwaiSetTextAreaHeight(input, lines);
          setButtonText();
      });

      input.addEventListener('change', resizeTextArea, false);
      input.addEventListener('cut', delayedResizeTextArea, false);
      input.addEventListener('paste', delayedResizeTextArea, false);
      input.addEventListener('drop', delayedResizeTextArea, false);
      input.addEventListener('keydown', delayedResizeTextArea, false);

      button.addEventListener('click', (event) => {
          onSendClick();
      });

      // If window, add event listener to mwai-open-button and mwai-close-button
      if (isWindow) {
          var openButton = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-open-button');
          openButton.addEventListener('click', (event) => {
              var chat = document.querySelector('#mwai-chat-6406ca505bbf2');
              chat.classList.add('mwai-open');
              // Only focus only on desktop (to avoid the mobile keyboard to kick-in)
              if (!isMobile) {
                  input.focus();
              }
          });
          var closeButton = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-close-button');
          closeButton.addEventListener('click', (event) => {
              var chat = document.querySelector('#mwai-chat-6406ca505bbf2');
              chat.classList.remove('mwai-open');
          });
          if (isFullscreen) {
              var resizeButton = document.querySelector('#mwai-chat-6406ca505bbf2 .mwai-resize-button');
              resizeButton.addEventListener('click', (event) => {
                  var chat = document.querySelector('#mwai-chat-6406ca505bbf2');
                  chat.classList.toggle('mwai-fullscreen');
              });
          }
      }

      // Get back the previous chat if any for the same ID
      var chatHistory = [];
      if (memorizeChat) {
          chatHistory = localStorage.getItem('mwai-chat-6406ca505bbf2');
          if (chatHistory) {
              memorizedChat = JSON.parse(chatHistory);
              memorizedChat = memorizedChat.filter(x => x && x.html && x.role);
              memorizedChat.forEach(x => {
                  addReply(x.html, x.role, true);
              });
          }
          else {
              memorizedChat = [];
          }
      }
      if (memorizedChat.length === 0) {
          memorizedChat.push({ role: 'assistant', content: startSentence, who: rawAiName, html: startSentence });
          addReply(startSentence, 'assistant');
      }
  }

  // Let's go totally meoooow on this! 
  mwai_6406ca505bbf2_initChatBot();

  var file_upload_input = document.querySelector('#fileUpload');
  file_upload_input.addEventListener('change', (event) => {
      // WARNING: For POST requests, body is set to null by browsers.
      var formData = new FormData();
      // data.append("file", fileInput.files[0], "Screenshot 2024-07-13 at 10.03.57.png");
      formData.append('file', document['getElementById']('fileUpload')['files'][0]);
      formData.append("question", "tóm tắt file này cho tôi");
      var xhr = new XMLHttpRequest();
      // xhr.withCredentials = true;
      xhr.addEventListener("readystatechange", function() {
      if(this.readyState === 4) {
          console.log(this.responseText);
          res = JSON.parse(this.responseText);
          console.log(res);
          if(res && res.is_ok){
              add_question_data_to_history('user', res.filePart);
              addReply(res.originalname, 'user');
          }
      }
      });
      xhr.open("POST", "https://ai.sbaygroup.net/api/v1/files/upload_file");
      xhr.send(formData);
  });
  function add_question_data_to_history(role, message_data){
      var need_to_added_msg = true;
      if(role == 'user'){
          if(contents_data.length > 0 && contents_data[contents_data.length-1].role == 'user'){
              var temp_last_parts = contents_data[contents_data.length-1].parts;
              temp_last_parts.push(message_data);
              contents_data[contents_data.length-1].parts = temp_last_parts;
              need_to_added_msg = false;
          }
      }
      if(need_to_added_msg){
          contents_data.push(
              {
                  "role": role,
                  "parts": [message_data]
              }
          );
      }
  }

})();