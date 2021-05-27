# Учебный проект 3 "RSS агрегатор" из курса обучения "Фронтенд-разработчик" на Hexlet

[![Actions Status](https://github.com/KalyakinAG/frontend-project-lvl3/workflows/hexlet-check/badge.svg)](https://github.com/KalyakinAG/frontend-project-lvl3/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/94dbf1ba46e8c03efc70/maintainability)](https://codeclimate.com/github/KalyakinAG/frontend-project-lvl3/maintainability)
[![Node CI](https://github.com/KalyakinAG/frontend-project-lvl3/workflows/Node%20CI/badge.svg)](https://github.com/KalyakinAG/frontend-project-lvl3/actions)

## Описание

Реализован агрегатор RSS потоков. Интерфейс позволяет добавлять адреса RSS. Новости ленты обновляются с заданной периодичностью.
Основное внимание в проекте уделено реализации интерфейса с использованием разделения слоёв приложения: модель, вид, контролер.

Интерфейс реализует сценарии: добавление, проверка на дубль, проверка на правильность ссылки, проверка на существование ресурса, проверка на ошибки сети, блокировка интерфейса в течении транзакции добавления, открытие карточки с описанием новости, отметка просмотренных новостей.

В приложении предусмотрена локализация интерфейса. Интерфес сформирован с использованием пакета bootstrap 4.

## Пример работы

Дополнительные фиды для теста:

- https://habr.com/ru/rss/all/all/?fl=ru
- http://lorem-rss.herokuapp.com/feed?unit=second

[Деплой получившегося приложения на Vercel](https://frontend-project-lvl3-beta-lovat.vercel.app/)

## Установка и запуск

### Установка из репозитория github

- Склонировать репозиторий
- Перейти в текущую директорию пакета
- Установить пакет
- Собрать пакет

```bash
> git clone https://github.com/KalyakinAG/frontend-project-lvl3.git ./rss
> cd rss
> make install
> make build
```

После сборки результат доступен здесь: ./dist/index.html

## Удаление

Выполнить команду в директории пакета:

```bash
> make uninstall
```
