workflow "CI/Test" {
  on = "push"
  resolves = ["Test"]
}

action "Test" {
  uses = "actions/npm@master"
  args = "test"
}
