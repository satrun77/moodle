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
defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->libdir . '/form/select.php');

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
     * @param string $serverfile Contains the ajax request URL path
     * @param mixed $attributes Either a typical HTML attribute string or an associative array
     */
    public function MoodleQuickForm_ajaxselector($elementName = null, $elementLabel = null, $serverfile = null, $attributes = null) {
        global $CFG;

        // Set ajax request URL.
        if (is_string($serverfile)) {
            $this->serverfile = $CFG->wwwroot . $serverfile;
        }

        // Set options to pre-populate the select element or to be used when JavaScript is disabled.
        $options = array();
        if (isset($attributes['options'])) {
            $options = $attributes['options'];
            unset($attributes['options']);
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

        // When JS is disabled the element attribute 'searchvalue' holds the value of the keyword search.
        // Unset the attribute so that it is not rendered as an attribute in the select element.
        $searchvalue = '';
        if (isset($this->_attributes['searchvalue'])) {
            $searchvalue = $this->_attributes['searchvalue'];
            unset($this->_attributes['searchvalue']);
        }
        $searchid = $this->_attributes['id'] . '_search';
        $searchname = $this->_attributes['name'] . '_search';
        $searchbtn = $this->_attributes['name'] . '_btn';
        $selectedlistid = $this->_attributes['id'] . '_searchableselector-selected';

        $options = array(
            'selectid'       => $this->_attributes['id'],
            'searchfieldid'  => $searchid,
            'selectedlistid' => $selectedlistid,
            'serverfile'     => $this->serverfile,
            'serverparams'   => 'courseid=' . $COURSE->id,
            'ismultiple'     => $this->getMultiple(),
        );
        $PAGE->requires->yui_module('moodle-core-searchableselector', 'M.core.searchableselector.init', array($options));

        $html = html_writer::start_tag('div', array('class' => 'searchableselector-textfield'));
        $html .= html_writer::label(get_string('search'), $searchid);
        $html .= html_writer::empty_tag('input', array(
            'type'  => 'text',
            'id'    => $searchid,
            'name'  => $searchname,
            'value' => $searchvalue
        ));
        $html .= html_writer::start_tag('noscript');
        $html .= html_writer::empty_tag('input', array('type' => 'submit', 'value' => get_string('go'), 'name' => $searchbtn));
        $html .= html_writer::end_tag('noscript');
        $html .= html_writer::end_tag('div');
        $html .= html_writer::tag('ul', '', array('class' => 'searchableselector-selected', 'id' => $selectedlistid));

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

   /**
    * Override to disable the options check. The content of the select element is changeable on the fly.
    *
    * @param array $submitValues submitted values
    * @param bool $assoc if true the retured value is associated array
    * @return mixed
    */
    public function exportValue(&$submitValues, $assoc = false) {
        if (empty($this->_options)) {
            return $this->_prepareValue(null, $assoc);
        }

        $value = $this->_findValue($submitValues);
        if (is_null($value)) {
            $value = $this->getValue();
        }
        $value = (array)$value;

        if (empty($value)) {
            return $this->_prepareValue(null, $assoc);
        }
        if ($this->getMultiple()) {
            return $this->_prepareValue($value, $assoc);
        } else {
            return $this->_prepareValue($value[0], $assoc);
        }
    }
}
