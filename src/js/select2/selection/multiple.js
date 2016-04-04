define([
    'jquery',
    './base',
    '../utils'
], function ($, BaseSelection, Utils) {
    function MultipleSelection($element, options) {
        this.options = options;
        MultipleSelection.__super__.constructor.apply(this, arguments);
    }

    Utils.Extend(MultipleSelection, BaseSelection);

    MultipleSelection.prototype.render = function () {
        var $selection = MultipleSelection.__super__.render.call(this);

        $selection.addClass('select2-selection--multiple');

        $selection.html(
            '<ul class="select2-selection__rendered"></ul>'
        );

        return $selection;
    };

    MultipleSelection.prototype.bind = function (container, $container) {
        var self = this;

        MultipleSelection.__super__.bind.apply(this, arguments);

        this.$selection.on('click', function (evt) {
            self.trigger('toggle', {
                originalEvent: evt
            });
        });

        this.$selection.on(
            'click',
            '.select2-selection__choice__remove',
            function (evt) {
                // Ignore the event if it is disabled
                if (self.options.get('disabled')) {
                    return;
                }

                var $remove = $(this);
                var $selection = $remove.parent();

                var data = $selection.data('data');

                if(data.id !== 'collapsed') {
                    data = [data];
                } else {
                    data = data.extData;
                }

                $(data).each(function(i, data) {
                    self.trigger('unselect', {
                        originalEvent: evt,
                        data: data
                    });
                });
            }
        );
    };

    MultipleSelection.prototype.clear = function () {
        this.$selection.find('.select2-selection__rendered').empty();
    };

    MultipleSelection.prototype.display = function (data, container) {
        var template = this.options.get('templateSelection');
        var escapeMarkup = this.options.get('escapeMarkup');

        return escapeMarkup(template(data, container));
    };

    MultipleSelection.prototype.selectionContainer = function () {
        var $container = $(
            '<li class="select2-selection__choice">' +
            '<span class="select2-selection__choice__remove" role="presentation">' +
            '&times;' +
            '</span>' +
            '</li>'
        );

        return $container;
    };

    MultipleSelection.prototype.update = function (data) {
        this.clear();

        if (data.length === 0) {
            return;
        }

        var $selections = [];

        if (this.options.options.collapseWhen !== false && data.length >= this.options.options.collapseWhen) {

            var selectedText = this.options.get('translations').get('multipleSelected');

            obj = JSON.parse(JSON.stringify(data[0]));
            obj.extData = JSON.parse(JSON.stringify(data));

            obj.id = 'collapsed';
            obj.text = selectedText({count: data.length});;

            obj.title = [];
            $(data).each(function (i, item) {
                obj.title.push(item.title || item.text);
            });
            obj.title = obj.title.join("\n");

            data = [obj];

        }

        for (var d = 0; d < data.length; d++) {
            var selection = data[d];

            var $selection = this.selectionContainer();
            var formatted = this.display(selection, $selection);

            $selection.append(formatted);
            $selection.prop('title', selection.title || selection.text);

            $selection.data('data', selection);

            $selections.push($selection);
        }

        var $rendered = this.$selection.find('.select2-selection__rendered');

        Utils.appendMany($rendered, $selections);
    };

    return MultipleSelection;
});
