import {
    response,
    isTesting,
    setIsTesting,
    isStreamingCaptions,
    interval
} from './state.js';
import {
    getValueFromUrlParams,
    populateLanguageMenu,
    updateSidebarActiveStates,
    buttonTapped,
    muteButtonTapped,
    unmuteButtonTapped,
    translate,
    showRightTranscript,
    modalSetup
} from './ui.js';
import {
    checkLanguage,
    getTranscript,
    getMockTranscript
} from './api.js';

$(document).ready(function () {
    setIsTesting(false);

    getValueFromUrlParams();
    checkLanguage();

    $("#get-live-caption, #live-caption-empty2, #live-caption2").on("click", buttonTapped);
    $("#mute").hide();
    $("#unmute").show();

    setInterval(recurringFunction, interval);

    // Sidebar logic
    const menuToggleBtn = $('#menu-toggle');
    const closeMenuBtn = $('#close-menu-btn');
    const sidebar = $('#sidebar-menu');
    const body = $('body');
    const mainContent = $('#main-content');

    function openSidebar() {
        sidebar.addClass('open').attr('aria-hidden', 'false');
        menuToggleBtn.attr('aria-expanded', 'true');
        mainContent.attr('inert', 'true');
        sidebar.focus();
        const firstActiveOption = sidebar.find('.menu-option[aria-checked="true"]').first();
        if (firstActiveOption.length) {
            firstActiveOption.focus();
        } else {
            sidebar.find('.menu-option[role="radio"]').first().focus();
        }
    }

    function closeSidebar() {
        sidebar.removeClass('open').attr('aria-hidden', 'true');
        menuToggleBtn.attr('aria-expanded', 'false').focus();
        mainContent.removeAttr('inert');
    }

    menuToggleBtn.on('click', function () {
        sidebar.hasClass('open') ? closeSidebar() : openSidebar();
    });

    closeMenuBtn.on('click', closeSidebar);

    $(document).on('click', function (event) {
        if (sidebar.hasClass('open') &&
            !$(event.target).closest('#sidebar-menu').length &&
            !$(event.target).closest('#menu-toggle').length) {
            closeSidebar();
        }
    });

    sidebar.on('keydown', '.menu-option[role="radio"]', function (e) {
        const $this = $(this);
        const $group = $this.closest('[role="radiogroup"]');
        const $options = $group.find('.menu-option[role="radio"]');
        let currentIndex = $options.index($this);

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % $options.length;
            $options.eq(currentIndex).focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + $options.length) % $options.length;
            $options.eq(currentIndex).focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            $this.click();
        } else if (e.key === 'Escape') {
            closeSidebar();
        }
    });

    $('#sidebar-menu').on('click', '.menu-option', function () {
        const $this = $(this);
        const action = $this.data('action');
        const value = $this.data('value');

        $this.closest('[role="radiogroup"]').find('.menu-option[role="radio"]').attr({
            'aria-checked': 'false',
            'tabindex': -1
        });
        $this.attr({ 'aria-checked': 'true', 'tabindex': 0 });

        switch (action) {
            case 'stream':
                buttonTapped();
                break;
            case 'theme':
                if (value === 'dark') {
                    body.addClass('dark-mode');
                    $('#checkbox').prop('checked', true);
                } else {
                    body.removeClass('dark-mode');
                    $('#checkbox').prop('checked', false);
                }
                break;
            case 'language':
                translate(value);
                break;
            case 'audio':
                if (value === 'mute') {
                    muteButtonTapped();
                } else {
                    unmuteButtonTapped();
                }
                break;
        }
        updateSidebarActiveStates();
    });

    const legacyCheckbox = $("#checkbox");
    if (legacyCheckbox.length) {
        legacyCheckbox.on("change", () => {
            $('body').toggleClass('dark-mode');
            updateSidebarActiveStates();
        });
    }

    modalSetup();
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        body.addClass('dark-mode');
        $('#checkbox').prop('checked', true);
    }

    // Listen for forced mute event from speech.js
    $(document).on('mute-forced', function () {
        muteButtonTapped();
    });
});

function recurringFunction() {
    const mainCaptionEmpty = $("#live-caption-empty");
    const overlayCaptionEmpty = $("#live-caption-empty2");

    if (!response.input || response.input.trim() === "") {
        mainCaptionEmpty.show();
        $("#live-caption").hide();
        if (overlayCaptionEmpty.length) {
            overlayCaptionEmpty.show();
            if ($("#live-caption2").length) $("#live-caption2").parent().hide();
        }
    } else {
        mainCaptionEmpty.hide();
        $("#live-caption").show();
        if (overlayCaptionEmpty.length) {
            overlayCaptionEmpty.hide();
            if ($("#live-caption2").length) $("#live-caption2").parent().show();
        }
        showRightTranscript();
    }

    if (isStreamingCaptions) {
        isTesting ? getMockTranscript() : getTranscript();
    }
}
