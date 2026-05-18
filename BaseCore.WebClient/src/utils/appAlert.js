const ALERT_ROOT_ID = 'app-alert-root';
const ALERT_STYLE_ID = 'app-alert-style';

const ensureAlertRoot = () => {
    let root = document.getElementById(ALERT_ROOT_ID);
    if (!root) {
        root = document.createElement('div');
        root.id = ALERT_ROOT_ID;
        root.setAttribute('aria-live', 'polite');
        document.body.appendChild(root);
    }
    return root;
};

const ensureAlertStyle = () => {
    if (document.getElementById(ALERT_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = ALERT_STYLE_ID;
    style.textContent = `
        #${ALERT_ROOT_ID} {
            position: fixed;
            top: 18px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            width: min(520px, calc(100vw - 32px));
            pointer-events: none;
        }

        .app-alert {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 10px;
            padding: 14px 16px;
            border: 1px solid #f4c674;
            border-left: 5px solid #ffbe33;
            border-radius: 6px;
            background: #fff8e8;
            color: #222831;
            box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
            font-size: 15px;
            line-height: 1.4;
            pointer-events: auto;
            animation: app-alert-in 160ms ease-out;
        }

        .app-alert__message {
            flex: 1;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

        .app-alert__close {
            border: 0;
            background: transparent;
            color: #222831;
            cursor: pointer;
            font-size: 22px;
            line-height: 1;
            padding: 0 2px;
        }

        @keyframes app-alert-in {
            from {
                opacity: 0;
                transform: translateY(-8px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
};

export const installAppAlert = () => {
    if (typeof window === 'undefined' || window.__appAlertInstalled) return;

    window.__appAlertInstalled = true;
    window.alert = (message = '') => {
        ensureAlertStyle();
        const root = ensureAlertRoot();
        const alertBox = document.createElement('div');
        alertBox.className = 'app-alert';
        alertBox.setAttribute('role', 'alert');

        const messageEl = document.createElement('div');
        messageEl.className = 'app-alert__message';
        messageEl.textContent = String(message);

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'app-alert__close';
        closeButton.setAttribute('aria-label', 'Close alert');
        closeButton.textContent = 'x';

        const close = () => {
            alertBox.remove();
        };

        closeButton.addEventListener('click', close);
        alertBox.append(messageEl, closeButton);
        root.appendChild(alertBox);

        window.setTimeout(close, 3000);
    };
};
