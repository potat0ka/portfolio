from django.conf import settings
from django.db import migrations, models


def backfill_testimonial_status(apps, schema_editor):
    Testimonial = apps.get_model("core", "Testimonial")
    Testimonial.objects.filter(is_public=True).update(status="approved")
    Testimonial.objects.filter(is_public=False).update(status="pending")


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0003_portfolioasset_virtual_shield_photo_and_testimonial_default"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="testimonial",
            name="admin_notes",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="testimonial",
            name="reviewed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="testimonial",
            name="reviewed_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.SET_NULL,
                related_name="reviewed_testimonials",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="testimonial",
            name="status",
            field=models.CharField(
                choices=[("pending", "Pending review"), ("approved", "Approved"), ("rejected", "Rejected")],
                db_index=True,
                default="pending",
                max_length=16,
            ),
        ),
        migrations.RunPython(backfill_testimonial_status, migrations.RunPython.noop),
    ]
