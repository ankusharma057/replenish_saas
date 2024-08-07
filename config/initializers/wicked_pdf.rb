WickedPdf.config ||= {}
WickedPdf.config.merge!({
  layout: 'pdf.html'
})

Gem.bin_path('wkhtmltopdf-heroku', 'wkhtmltopdf-linux-amd64')