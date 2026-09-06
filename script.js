document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       SCROLL REVEAL
    ========================= */

    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    observer.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.12
        }
    );


    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });


    /* =========================
       AI CHAT
    ========================= */

    const input = document.getElementById("chat-input");
    const sendButton = document.getElementById("chat-send");
    const messages = document.getElementById("chat-messages");


    if (!input || !sendButton || !messages) {
        return;
    }


    function formatAIResponse(text) {

        let formatted = String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");


        formatted = formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


        const lines = formatted.split(/\n+/);

        let html = "";
        let inList = false;


        lines.forEach((line) => {

            const trimmed = line.trim();

            if (!trimmed) {
                return;
            }


            if (trimmed.startsWith("- ")) {

                if (!inList) {
                    html += "<ul>";
                    inList = true;
                }

                html += `<li>${trimmed.substring(2)}</li>`;

            } else {

                if (inList) {
                    html += "</ul>";
                    inList = false;
                }

                html += `<p>${trimmed}</p>`;
            }

        });


        if (inList) {
            html += "</ul>";
        }


        return html;
    }


    async function sendMessage() {

        const message = input.value.trim();

        if (!message) {
            return;
        }


        const userMessage = document.createElement("div");

        userMessage.className = "user-message";

        userMessage.textContent = message;

        messages.appendChild(userMessage);


        input.value = "";


        const loadingMessage = document.createElement("div");

        loadingMessage.className = "ai-message loading";

        loadingMessage.textContent = "Thinking...";

        messages.appendChild(loadingMessage);


        messages.scrollTop = messages.scrollHeight;

        sendButton.disabled = true;


        try {

        

            const API_URL = "ai-customer-request-triage-production.up.railway.app/chat";


            if (API_URL.includes("YOUR_DEPLOYED")) {
                throw new Error("AI backend URL has not been configured.");
            }


            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify({
                    message: message
                })

            });


            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}`
                );
            }


            const data = await response.json();


            loadingMessage.remove();


            const aiMessage = document.createElement("div");

            aiMessage.className = "ai-message";


            const answer =
                data.response ||
                data.message ||
                data.answer ||
                "I received a response, but could not display it.";


            aiMessage.innerHTML = formatAIResponse(answer);

            messages.appendChild(aiMessage);


        } catch (error) {

            console.error("AI Assistant Error:", error);


            loadingMessage.remove();


            const errorMessage = document.createElement("div");

            errorMessage.className = "ai-message";

            errorMessage.textContent =
                "The AI assistant is currently unavailable. Please try again later.";


            messages.appendChild(errorMessage);
        }


        sendButton.disabled = false;

        messages.scrollTop = messages.scrollHeight;
    }


    sendButton.addEventListener(
        "click",
        sendMessage
    );


    input.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {
                sendMessage();
            }

        }
    );

});