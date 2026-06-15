from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_asset_timestamps"),
    ]

    operations = [
        migrations.CreateModel(
            name="Skill",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, help_text="Skill name e.g. Python, Django, React")),
                (
                    "category",
                    models.CharField(
                        max_length=100,
                        default="General",
                        help_text="Category e.g. Languages, Frameworks, Tools",
                    ),
                ),
                (
                    "level",
                    models.PositiveSmallIntegerField(
                        default=50,
                        help_text="Proficiency level 0-100",
                    ),
                ),
                (
                    "icon_slug",
                    models.CharField(
                        max_length=100,
                        blank=True,
                        help_text="devicon slug e.g. python, django, react (optional)",
                    ),
                ),
                ("order", models.PositiveSmallIntegerField(default=0, help_text="Sort order (lower = first)")),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Skill",
                "verbose_name_plural": "Skills",
                "ordering": ["order", "name"],
            },
        ),
    ]
