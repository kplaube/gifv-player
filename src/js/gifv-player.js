/*global window, jQuery */

function GifvPlayer() {
    'use strict';
    this.init.apply(this, arguments);
}

(function (window, $) {
    'use strict';

    var VideoController, GifController;

    VideoController = {
        play: function ($element) {
            $element.find('> video')[0].play();
        },
        pause: function ($element) {
            $element.find('> video')[0].pause();
        },
        isPaused: function ($element) {
            return $element.find('> video')[0].paused;
        }
    };

    GifController = {
        play: function ($element) {
            var $img = $element.find('> img');
            $img.data('gifv-playing', true).attr('src', $img.data('gifv-original'));
        },
        pause: function ($element) {
            var $img = $element.find('> img');
            $img.data('gifv-playing', false).attr('src', $img.data('gifv-poster'));
            $element.removeClass('gifv-player-playing');
        },
        isPaused: function ($element) {
            return !$element.find('> img').data('gifv-playing');
        }
    };

    GifvPlayer.prototype = {
        selector: '.gifv-player',
        init: function (options) {
            this.options = options || {};
            this.videoSelector = this.selector + ' video';

            if (this.hasVideoSupport()) {
                this.controller = VideoController;
            } else {
                this.controller = GifController;
                this.replaceVideoWithWrapper();
            }

            this.bindEvents();
            this.emulateLoop();
            this.addOverlay();
        },
        replaceVideoWithWrapper: function () {
            $(this.videoSelector).replaceWith(function () {
                var $video = $(this);

                return $('<img />', {
                    src: $video.attr('poster'),
                    attr: {
                        width: $video.attr('width'),
                        height: $video.attr('height')
                    },
                    data: {
                        'gifv-poster': $video.attr('poster'),
                        'gifv-original': $video.data('gifv-original')
                    }
                });
            });
        },
        addOverlay: function () {
            $('<div class="gifv-player-overlay" />').appendTo(this.selector);
        },
        destroy: function () {
            $(document).off('.gifv');
        },
        bindEvents: function () {
            var player = this;

            $(document).on('click.gifv', this.selector, function (event) {
                event.preventDefault();

                var $player = $(this);
                player.playPause($player);
            });
        },
        emulateLoop: function () {
            // Some browsers (Firefox?) can't reliably respect the loop attribute
            // Here is a fix based on the following links:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=449157#c15
            // http://forestmist.org/blog/html5-audio-loops/
            $(this.videoSelector).removeAttr('loop').on('ended', function () {
                var $this = $(this), $clone = $this.clone(true);
                $this.replaceWith($clone);
                $clone[0].play();
            });
        },
        playPause: function ($video) {
            if (this.controller.isPaused($video)) {
                this.play($video);
            } else {
                this.pause($video);
            }
        },
        play: function ($video) {
            var $currentVideo = $(document).data('gifv-current');
            if ($currentVideo) {
                this.pause($currentVideo);
            }

            $(document).data('gifv-current', $video);
            $video.addClass('gifv-player-playing');

            this.controller.play($video);
        },
        pause: function ($video) {
            $(document).removeData('gifv-current');
            $video.removeClass('gifv-player-playing');

            this.controller.pause($video);
        },
        hasVideoSupport: function () {
            var testVideo = document.createElement('video');
            return (
                !!testVideo.canPlayType && (
                    (testVideo.canPlayType('video/mp4') !== '') || (testVideo.canPlayType('video/ogg') !== '')
                )
            );
        }
    };

}(this, jQuery));
