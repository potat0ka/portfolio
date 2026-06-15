# Generated manually for Vercel deployment without local Django
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PortfolioAsset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='Main Portfolio Assets', max_length=255)),
                ('cv_pdf', models.FileField(blank=True, help_text='Upload your latest CV/Resume (PDF).', null=True, upload_to='resume/')),
                ('profile_photo', models.ImageField(blank=True, help_text='Upload your main profile photo.', null=True, upload_to='images/')),
                ('is_active', models.BooleanField(default=True, help_text='Set to True to make these assets live on the site.')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Portfolio Asset',
                'verbose_name_plural': 'Portfolio Assets',
            },
        ),
    ]
