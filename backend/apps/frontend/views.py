from django.shortcuts import render


def react_app(request):
    """
    Serve the approved React/Vite frontend without modifying any UI code.
    """
    return render(request, "react_portfolio.html")

