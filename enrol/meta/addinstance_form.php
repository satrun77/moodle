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
 * Adds instance form
 *
 * @package    enrol_meta
 * @copyright  2010 Petr Skoda {@link http://skodak.org}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once("$CFG->libdir/formslib.php");

class enrol_meta_addinstance_form extends moodleform {
    protected $course;

    function definition() {

        $mform  = $this->_form;
        $course = $this->_customdata['course'];
        $this->course = $course;

        $search = $this->_customdata['search'];
        $options = '/enrol/meta/search_ajax.php';

        $mform->addElement('header','general', get_string('pluginname', 'enrol_meta'));

        $mform->addElement('ajaxselector', 'link', get_string('linkedcourse', 'enrol_meta'), $options, array(
            'multiple'    => 'multiple',
            'size'        => 10,
            'searchvalue' => $search,
            'options'     =>  enrol_meta_search($search, $course)
        ));
        $mform->addRule('link', get_string('required'), 'required', null, 'client');
        $mform->addHelpButton('link', 'linkedcourse', 'enrol_meta');

        $mform->addElement('hidden', 'id', null);
        $mform->setType('id', PARAM_INT);

        $this->add_action_buttons(true, get_string('addinstance', 'enrol'));

        $this->set_data(array('id'=>$course->id));
    }

    function validation($data, $files) {
        global $DB;

        $errors = parent::validation($data, $files);

        if (empty($data['link'])) {
            $errors['link'] = get_string('required');
            return $errors;
        }

        $existing = $DB->get_records('enrol',
                                     array('enrol' => 'meta', 'courseid' => $this->course->id),
                                     '',
                                     'customint1, id');

        foreach ($data['link'] as $link) {
            if (!$c = $DB->get_record('course', array('id' => $link))) {
                $errors['link'] = get_string('required');
            } else {
                $coursecontext = context_course::instance($c->id);
                if (!$c->visible and !has_capability('moodle/course:viewhiddencourses', $coursecontext)) {
                    $errors['link'] = get_string('error');
                } else if (!has_capability('enrol/meta:selectaslinked', $coursecontext)) {
                    $errors['link'] = get_string('error');
                } else if ($c->id == SITEID or $c->id == $this->course->id or isset($existing[$c->id])) {
                    $errors['link'] = get_string('error');
                }
            }
        }

        return $errors;
    }
}

