from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_testimonial"),
    ]

    operations = [
        migrations.AddField(
            model_name="portfolioasset",
            name="virtual_shield_photo",
            field=models.ImageField(
                blank=True,
                help_text="Upload the separate Potatoka.py Virtual Shield image.",
                null=True,
                upload_to="images/",
            ),
        ),
        migrations.AlterField(
            model_name="testimonial",
            name="is_public",
            field=models.BooleanField(default=False),
        ),
    ]

