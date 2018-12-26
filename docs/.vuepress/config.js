module.exports = {
  title: 'Fabula',
  description: 'Minimalist server configuration and task management.',
  base: '/fabula',
  themeConfig: {
    repo: 'nuxa/fabula',
    editLinks: true,
    docsDir: 'docs',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        sidebar: {
          '/': sidebarLinks('en')
        }
      },
    }
  }
}

function sidebarLinks (locale) {
  const translations = {
    en: {
      groups: {
        main: 'Guide'
      },
      'page/': 'Introduction'
    }
  }

  const localePageTitle = (page) => {
    if (translations[locale][`page/${page}`]) {
      return [page, translations[locale][`page/${page}`]]
    }
    return page
  }

  const toc = [
    {
      title: translations[locale].groups.main,
      collapsable: false,
      children: [
        '',
        'components',
        'commands',
        'authentication'
      ].map(child => localePageTitle(child))
    }
  ]

  return toc
}
