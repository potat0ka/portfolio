from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Testimonial",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("author_name", models.CharField(max_length=255)),
                ("author_email", models.EmailField(blank=True, max_length=254, null=True)),
                ("message", models.TextField(validators=[django.core.validators.MaxLengthValidator(2000)])),
                ("is_public", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Testimonial",
                "verbose_name_plural": "Testimonials",
                "ordering": ["-created_at"],
            },
        ),
    ]

