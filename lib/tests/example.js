var test = require('tape');

test('Example Unit Test', function (t) {
    // We plan to do 2 assertions in this unit test
    t.plan(2);

    t.equal(1+2, 3, 'Basic arithmetic still works');
    t.ok(3+4>5, 'Inequalities are as we might expect');
});