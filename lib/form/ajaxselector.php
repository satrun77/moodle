<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.


/**
 * Searchable select type element using ajax
 *
 * Contains HTML class for a searchable select type element using ajax
 *
 * @package   core_form
 * @copyright 2013 Mohamed Alsharaf <m.alsharaf@massey.ac.nz>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('select.php');

/**
 * Searchable select type element using ajax
 *
 * @package   core_form
 * @category  form
 * @copyright 2013 Mohamed Alsharaf <m.alsharaf@massey.ac.nz>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class MoodleQuickForm_ajaxselector extends MoodleQuickForm_select {

    /**
     * Ajax request URL
     *
     * @var string
     */
    protected $serverfile = '';

    /**
     * Constructor
     *
     * @param string $elementName Select name attribute
     * @param mixed $elementLabel Label(s) for the select
     * @param string|array $options Contains the ajax request URL path or array of options when JavaScript is disabled
     * @param mixed $attributes Either a typical HTML attribute string or an associative array
     */
    public function MoodleQuickForm_ajaxselector($elementName = null, $elementLabel = null, $options = null, $attributes = null) {
        global $CFG;

        // Set ajax request URL.
        if (is_string($options)) {
            $this->serverfile = $CFG->wwwroot . $options;
            $options = array();
        }

        // Set size default to 12.
        if (empty($attributes) || empty($attributes['size'])) {
            $attributes['size'] = 12;
        }
        parent::MoodleQuickForm_select($elementName, $elementLabel, $options, $attributes);
    }

    /**
     * Returns HTML for ajax selector form element.
     *
     * @return string
     */
    public function toHtml() {
        global $PAGE, $COURSE;

        $searchvalue = '';
        if (isset($this->_attributes['searchvalue'])) {
            $searchvalue = $this->_attributes['searchvalue'];
            unset($this->_attributes['searchvalue']);
        }
        $searchid = $this->_attributes['id'] . '_search';
        $searchname = $this->_attributes['name'] . '_search';
        $searchbtn = $this->_attributes['name'] . '_btn';

        $options = array(
            'searchid' => $searchid,
            'listid'   => $this->_attributes['id'],
            'url'      => $this->serverfile,
            'courseid' => $COURSE->id
        );
        $module = array('name' => 'form_ajaxselector', 'fullpath' => '/lib/form/ajaxselector.js');
        $PAGE->requires->js_init_call('M.form_ajaxselector.init', array($options), true, $module);

        $html = html_writer::start_tag('div', array('class' => 'meta-searchui'));
        $html .= html_writer::label(get_string('search'), $searchid);
        $html .= html_writer::empty_tag('input', array('type' => 'text',
                                                       'id' => $searchid,
                                                        'name' => $searchname,
                                                        'value' => $searchvalue));
        $html .= html_writer::start_tag('noscript');
        $html .= html_writer::empty_tag('input', array('type' => 'submit', 'value' => get_string('go'), 'name'  => $searchbtn));
        $html .= html_writer::end_tag('noscript');
        $html .= html_writer::end_tag('div');

        return $html . parent::toHtml();
    }

    /**
     * Called by HTML_QuickForm whenever form event is made on this element
     *
     * @param string $event
     * @param mixed $arg
     * @param object $caller
     * @return void
     */
    public function onQuickFormEvent($event, $arg, &$caller) {
        if ('createElement' == $event) {
            // Register the "search button" as no submit.
            $caller->registerNoSubmitButton($arg[0] . '_btn');
        }
        return parent::onQuickFormEvent($event, $arg, $caller);
    }
}
