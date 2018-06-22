---
layout: default
title: Projects
permalink: /projects/
---
<article class="content">
    <div class="post">
        <div class="projects row">
            {% for i in site.data.projects %}
            <div class="col-lg-4 col-sm-6">
                <div class="card project-card">
                    <div class="card-body">
                        <h4 class="card-title">{{ i.name }}</h4>
                        <h6 class="card-subtitle text-muted">{{ i.date }}</h6>
                        <p class="card-text">
                        {{ i.description }}
                        </p>
                    </div>
                    <div class="card-footer">
                        {% if i.url %}
                        <a href="{{ i.url }}" class="btn btn-raised btn-primary" target="_blank">View</a>
                        {% endif %}
                        {% if i.code %}
                        <a href="{{ i.code }}" class="btn btn-raised btn-info" target="_blank">Code</a>
                        {% endif %}
                    </div>
                </div>
            </div>
            {% endfor %}
        </div>
    </div>
</article>