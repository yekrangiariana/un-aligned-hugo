---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
slug: "{{ .Name }}"
description: ""
issueNumber: 1
volume: 9
tagline: ""
categories: 
  - "The Gordian Magazine"
articleList:
  - ""
  - ""
  - ""
image: "/images/{{ .Name }}.jpg"
---

Welcome to this issue of The Gordian Magazine.

// hugo new gordian/issue-4.md