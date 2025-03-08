document.addEventListener('DOMContentLoaded', () => {
    const pinLightbox = document.getElementById('pin-lightbox');
    const pinInput = document.getElementById('pin-input');
    const pinSubmit = document.getElementById('pin-submit');
    const pinError = document.getElementById('pin-error');

    // Correct PIN (you should use a more secure method in production)
    const CORRECT_PIN = '1935';

    // Number of attempts
    let attempts = 3;
    let recaptchaToken = null;

    // Google reCAPTCHA initialization
    function initRecaptcha() {
        grecaptcha.ready(() => {
            grecaptcha.execute('6LdkuG4qAAAAAHg7DtMtKAH0QvgHsf1FKiLY5Dhv', {action: 'pin_validation'})
                .then((token) => {
                    recaptchaToken = token;
                });
        });
    }

    // Validate PIN with reCAPTCHA
    async function validatePin() {
        const enteredPin = pinInput.value.trim();

        // Refresh reCAPTCHA token
        try {
            recaptchaToken = await new Promise((resolve) => {
                grecaptcha.ready(() => {
                    grecaptcha.execute('6LdkuG4qAAAAAHg7DtMtKAH0QvgHsf1FKiLY5Dhv', {action: 'pin_validation'})
                        .then(resolve);
                });
            });
        } catch (error) {
            pinError.textContent = 'reCAPTCHA verification failed. Please try again.';
            return;
        }

        // Verify PIN and reCAPTCHA on the server
        try {
            const response = await fetch('/verify-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pin: enteredPin,
                    recaptchaToken: recaptchaToken
                })
            });

            const result = await response.json();

            if (result.success) {
                // Successful PIN entry
                pinLightbox.classList.remove('active');
                window.location.href = 'dashboard.html';
            } else {
                // Incorrect PIN
                attempts--;

                if (attempts > 0) {
                    pinError.textContent = `Incorrect PIN. ${attempts} attempts remaining.`;
                    pinInput.value = '';
                    
                    // Add shake animation
                    const pinContainer = document.querySelector('.pin-container');
                    pinContainer.classList.add('shake');
                    setTimeout(() => {
                        pinContainer.classList.remove('shake');
                    }, 500);

                    // Refresh reCAPTCHA
                    initRecaptcha();
                } else {
                    // Block access after 3 failed attempts
                    pinError.textContent = 'Too many incorrect attempts. Access blocked.';
                    pinInput.disabled = true;
                    pinSubmit.disabled = true;

                    setTimeout(() => {
                        window.location.href = 'blocked.html';
                    }, 2000);
                }
            }
        } catch (error) {
            pinError.textContent = 'Verification failed. Please try again.';
        }
    }

    // Server-side verification (example Express.js route)
    /*
    app.post('/verify-pin', async (req, res) => {
        const { pin, recaptchaToken } = req.body;

        // Verify reCAPTCHA
        const recaptchaVerifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const recaptchaResponse = await fetch(recaptchaVerifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `secret=YOUR_SECRET_KEY&response=${recaptchaToken}`
        });

        const recaptchaResult = await recaptchaResponse.json();

        // Check PIN and reCAPTCHA score
        if (recaptchaResult.success && recaptchaResult.score > 0.5 && pin === CORRECT_PIN) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
    */

    // Event Listeners
    pinSubmit.addEventListener('click', validatePin);

    // Allow Enter key to submit
    pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            validatePin();
        }
    });

    // Only allow numeric input
    pinInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Initialize reCAPTCHA
    initRecaptcha();

    // Show lightbox immediately
    pinLightbox.classList.add('active');
    pinInput.focus();
});