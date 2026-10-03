import { observeAttributes, observeElement } from '../../core/observer.js';

function getDeveloperProductIdFromUrl() {
    return (
        window.location.pathname.match(
            /\/developer-product\/\d+\/product\/(\d+)/i,
        )?.[1] || null
    );
}

function canClickBuyButton(button) {
    return (
        button.isConnected &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true'
    );
}

function clickWhenReady(button, productId) {
    if (productId && button.dataset.productId !== productId) return;

    const tryClick = () => {
        if (!canClickBuyButton(button)) return false;
        button.click();
        return true;
    };

    if (tryClick()) return;

    const observer = observeAttributes(
        button,
        () => {
            if (tryClick()) observer.disconnect();
        },
        ['aria-disabled', 'class', 'disabled'],
    );
}

// PRIVATE BUILD: a link carrying "?RoValra-Auto-Buy" must never press a buy
// button on its own. The user always clicks Buy themselves.
const PRIVATE_BUILD_DISABLE_AUTO_BUY = true;

export function init() {
    if (PRIVATE_BUILD_DISABLE_AUTO_BUY) return;
    if (
        !window.location.pathname.includes('/developer-product/') ||
        !window.location.search.includes('RoValra-Auto-Buy')
    ) {
        return;
    }

    const productId = getDeveloperProductIdFromUrl();

    const runAutoBuy = () => {
        observeElement(
            'button.buy-button[data-product-id]',
            (button) => clickWhenReady(button, productId),
            { multiple: true },
        );
    };

    if (document.readyState === 'complete') {
        runAutoBuy();
    } else {
        window.addEventListener('load', runAutoBuy, { once: true });
    }
}
