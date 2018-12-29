workflow "CI" {
  on = "push"
  resolves = ["Install", "Audit", "Lint"]
}

action "Install" {
  uses = "nuxt/actions-yarn@master"
  args = "install --frozen-lockfile --non-interactive"
}

action "Audit" {
  uses = "nuxt/actions-yarn@master"
  args = "audit"
}

action "Lint" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Install"]
  args = "lint"
}

action "Test" {
  uses = "actions/npm@master"
  needs = ["Install"]
  args = "test"
}
