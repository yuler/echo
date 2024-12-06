# README

This project is for learning English.

## Development

- All in [Rails](https://rubyonrails.org/)
- Icons from [Lucide](https://lucide.dev/icons)

## Features

- Crawl article from [vira](https://m.liulishuo.com/en/vira.html) daily.

## Roadmap

- [-] Save progress in cookie?
- [ ] Home page, footer
- [ ] Generate poster for post
- [ ] Post, #words, Create word table
- [-] Polish custom audio player
- [ ] Set web site host
- [ ] Authorization, w/ email, password
- [ ] 签到, Share Image
- [-] rails settings

---

- [ ] Design UI
- [ ] 优化 Job 失败, 成功通知
- [ ] Integration Telegram

## Backup

Use [gobackup](https://gobackup.github.io/) for backup daily.

```yaml
# touch ~/.gobackup/gobackup.yml
web:
  username: is.yuler@gmail.com
  password: <password>
models:
  reads:
    schedule:
      cron: "1 0 * * *"
    compress_with:
      type: tgz
    split_with:
      chunk_size: 1G
    storages:
      local:
        type: local
        keep: 10
        path: /data/backups
    databases:
      reads_production:
        type: sqlite
        path: /home/reads_storage/production.sqlite3
    # archive:
    #   includes:
    #     - /home/reads_storage
    #   excludes:
    #     - /home/reads_storage/*.sqlite3*
    notifiers:
      telegram:
        endpoint: proxy-telegram.deno.dev # proxy
        type: telegram
        chat_id: <your-chat-id>
        token: <your-bot-token>
```

```bash
gobackup start
gobackup perform
```
