M.form_ajaxselector = {};
M.form_ajaxselector.init = function(Y, options) {
    var select = Y.one('#' + options.listid), spinner, searchinput = Y.one('#' + options.searchid);
    select.hide();
    searchinput.on('keyup', function(e) {
        spinner = M.util.add_spinner(Y, searchinput.get('parentNode'));
        spinner.show();
        Y.io(options.url, {
            method: 'POST',
            data: build_querystring({
                keyword: stripHTML(e.currentTarget.get('value')),
                courseid: options.courseid
            }),
            on: {
                success: function(tid, outcome) {
                    try {
                        var data = Y.JSON.parse(outcome.responseText);
                        select.set('innerHTML', '');
                        Y.Object.each(data.courses, function(value, index) {
                            var option = Y.Node.create('<option />')
                                    .set('text', stripHTML(value))
                                    .set('value', parseInt(index));
                            select.append(option);
                        });
                        select.show();
                    } catch (ex) {
                        return alert(ex.message);
                    }
                },
                complete: function() {
                    spinner.hide();
                }
            }
        });
    });
};