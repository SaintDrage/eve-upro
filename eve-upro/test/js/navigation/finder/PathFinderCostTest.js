PathFinderCostTest = TestCase("PathFinderCostTest")

PathFinderCostTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.costs = [];
   Fixture.rules = [];
};

PathFinderCostTest.prototype.givenAPathFinderCostFromSystem = function(securityValue)
{
   var system =
   {
      security: securityValue
   };
   var cost = new upro.nav.finder.PathFinderCost();

   Fixture.rules.forEach(function(rule)
   {
      cost.costItems = rule.addBasicCost(cost.costItems, system, false);
   });
   Fixture.costs.push(cost);
};

PathFinderCostTest.prototype.givenAPathFinderCost = function(costItems)
{
   var cost = new upro.nav.finder.PathFinderCost();

   cost.costItems = costItems;
   Fixture.costs.push(cost);
};

PathFinderCostTest.prototype.givenARule = function(rule)
{
   Fixture.rules.push(rule);
};

PathFinderCostTest.prototype.whenCallingCompare = function()
{
   var costA = Fixture.costs.pop();
   var costB = Fixture.costs.pop();

   Fixture.comparisonResult = costA.compareTo(costB, Fixture.rules);
};

PathFinderCostTest.prototype.whenCallingPlus = function()
{
   var costA = Fixture.costs.pop();
   var costB = Fixture.costs.pop();

   Fixture.costs.push(costA.plus(costB, Fixture.rules));
};

PathFinderCostTest.prototype.thenTheComparisonResultShouldBeNegative = function()
{
   assertTrue(Fixture.comparisonResult < 0);
};

PathFinderCostTest.prototype.thenTheComparisonResultShouldBeEqual = function()
{
   assertTrue(Fixture.comparisonResult == 0);
};

PathFinderCostTest.prototype.thenTheComparisonResultShouldBePositive = function()
{
   assertTrue(Fixture.comparisonResult > 0);
};

PathFinderCostTest.prototype.testSimpleMinimumSecurity = function()
{
   this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
   this.givenAPathFinderCostFromSystem(1.0);
   this.givenAPathFinderCostFromSystem(1.0);

   this.whenCallingCompare();

   this.thenTheComparisonResultShouldBeEqual();
};

PathFinderCostTest.prototype.testAdd = function()
{
   this.givenAPathFinderCost(
   {
      minSecurityBelowCount: 2,
      jumps: 2
   });
   this.givenAPathFinderCost(
   {
      minSecurityBelowCount: 1,
      jumps: 1
   });
   this.givenAPathFinderCost(
   {
      minSecurityBelowCount: 1,
      jumps: 1
   });

   this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());

   this.whenCallingPlus();
   this.whenCallingCompare();

   this.thenTheComparisonResultShouldBeEqual();
};
