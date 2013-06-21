@enrol @enrol_meta
Feature: todo...
  In order to ...
  As a teacher
  I need to ...

  Background:
    Given the following "users" exist:
      | username | firstname | lastname | email |
      | teacher1 | Teacher | 1 | teacher1@asd.com |
      | student1 | Student | 1 | student1@asd.com |
    And the following "courses" exist:
      | fullname | shortname | format |
      | Course 1 | C1 | topics |
      | Course 2 | C2 | topics |
      | Course 3 | C3 | topics |
    And the following "course enrolments" exist:
      | user | course | role |
      | teacher1 | C1 | editingteacher |
      | student1 | C2 | student |

  @javascript
  Scenario: Self-enrolment enabled
    Given I log in as "teacher1"
    And I follow "Course 1"
    And I expand "Users" node
    And I follow "Enrolment methods"
    And I set the field "Add method" to "Course meta link"
