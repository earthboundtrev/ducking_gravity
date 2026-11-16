(function (root) {
  var ENDPOINT = "/api/contact";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  function validateEmail(email) {
    return EMAIL_RE.test(email);
  }

  function validatePhone(phone) {
    return PHONE_RE.test(phone);
  }

  function validateName(name) {
    return String(name || "").trim().length >= 2;
  }

  function showError(input, message) {
    var errorElement = input.nextElementSibling;
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = "block";
    input.style.borderColor = "red";
  }

  function clearError(input) {
    var errorElement = input.nextElementSibling;
    if (errorElement) errorElement.style.display = "none";
    input.style.borderColor = "";
  }

  function recaptchaResponse() {
    if (typeof grecaptcha === "undefined" || typeof grecaptcha.getResponse !== "function") {
      return "";
    }
    return grecaptcha.getResponse();
  }

  function resetRecaptcha() {
    if (typeof grecaptcha !== "undefined" && typeof grecaptcha.reset === "function") {
      grecaptcha.reset();
    }
  }

  function setStatus(formStatus, ok, text) {
    if (!formStatus) return;
    formStatus.style.display = "block";
    formStatus.style.color = ok ? "green" : "red";
    formStatus.textContent = text;
  }

  function safePublicError(payload) {
    if (!payload || typeof payload.error !== "string") return "";
    var error = payload.error.trim();
    if (!error || error.length > 120) return "";
    if (/key|secret|token|bearer|resend/i.test(error)) return "";
    return error;
  }

  async function submitContactPayload(payload, fetchImpl) {
    var send = fetchImpl || fetch;
    var response = await send(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    var data = {};
    try {
      data = await response.json();
    } catch (_err) {
      data = {};
    }
    if (!response.ok) {
      var error = new Error(safePublicError(data) || "Failed to send message");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function bindContactForm(form, options) {
    if (!form) return;
    var opts = options || {};
    var formStatus = opts.formStatus || document.getElementById("form-status");
    var recaptchaError = opts.recaptchaError || document.getElementById("recaptcha-error");
    var fetchImpl = opts.fetchImpl;

    var inputs = form.querySelectorAll("input, textarea");
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        clearError(input);
      });
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var isValid = true;
      var formData = new FormData(form);
      var firstName = formData.get("first_name") || "";
      var lastName = formData.get("last_name") || "";
      var email = formData.get("email") || "";
      var phone = formData.get("phone") || "";
      var subject = (formData.get("subject") || "").trim();
      var message = (formData.get("message") || "").trim();

      if (!validateName(firstName)) {
        showError(document.getElementById("first-name"), "Please enter a valid first name");
        isValid = false;
      }
      if (!validateName(lastName)) {
        showError(document.getElementById("last-name"), "Please enter a valid last name");
        isValid = false;
      }
      if (!validateEmail(email)) {
        showError(document.getElementById("email"), "Please enter a valid email address");
        isValid = false;
      }
      if (!validatePhone(phone)) {
        showError(document.getElementById("phone"), "Please enter a valid phone number");
        isValid = false;
      }
      if (!subject) {
        showError(document.getElementById("subject"), "Please enter a subject");
        isValid = false;
      }
      if (!message) {
        showError(document.getElementById("message"), "Please enter a message");
        isValid = false;
      }

      var token = recaptchaResponse();
      if (!token) {
        if (recaptchaError) recaptchaError.style.display = "block";
        isValid = false;
      } else if (recaptchaError) {
        recaptchaError.style.display = "none";
      }

      if (!isValid) return;

      var submitButton = form.querySelector(".cta-button, button[type='submit']");
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        await submitContactPayload(
          {
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: String(email).trim(),
            phone: String(phone).trim(),
            subject: subject,
            message: message,
            recaptchaToken: token,
            source: form.getAttribute("data-contact-source") === "birthday" ? "birthday" : "contact",
          },
          fetchImpl,
        );
        setStatus(formStatus, true, "Message sent successfully!");
        form.reset();
      } catch (error) {
        setStatus(
          formStatus,
          false,
          error && error.message ? "Failed to send message: " + error.message : "Failed to send message",
        );
      } finally {
        resetRecaptcha();
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Message";
        }
      }
    });
  }

  function boot() {
    var form = document.getElementById("contact-form");
    if (form) bindContactForm(form);
  }

  var api = {
    bindContactForm: bindContactForm,
    submitContactPayload: submitContactPayload,
    validateEmail: validateEmail,
    validateName: validateName,
    validatePhone: validatePhone,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.dgContactForm = api;
    if (root.document) {
      if (root.document.readyState === "loading") {
        root.document.addEventListener("DOMContentLoaded", boot);
      } else {
        boot();
      }
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
