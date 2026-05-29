using CubeTetris.Persistence;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace CubeTetris.UI
{
    public class TitleMenu : MonoBehaviour
    {
        const string GameSceneName = "GameScene";

        GameObject _leaderboardRoot;
        Text _leaderboardBody;

        void Awake()
        {
            EnsureEventSystem();

            var canvasGo = new GameObject("Canvas");
            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasGo.AddComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            canvasGo.AddComponent<GraphicRaycaster>();

            CreateText(canvasGo.transform, "Cube Tetris", 40, new Vector2(0, 120), TextAnchor.MiddleCenter);

            CreateButton(canvasGo.transform, "Quick Start", new Vector2(0, 40), () =>
            {
                SceneManager.LoadScene(GameSceneName);
            });

            CreateButton(canvasGo.transform, "View Leaderboard", new Vector2(0, -20), () =>
            {
                ToggleLeaderboard();
            });

            CreateButton(canvasGo.transform, "Quit", new Vector2(0, -80), () =>
            {
                Application.Quit();
#if UNITY_EDITOR
                UnityEditor.EditorApplication.isPlaying = false;
#endif
            });

            _leaderboardRoot = new GameObject("Leaderboard");
            _leaderboardRoot.transform.SetParent(canvasGo.transform, false);
            var lr = _leaderboardRoot.AddComponent<RectTransform>();
            lr.anchorMin = Vector2.zero;
            lr.anchorMax = Vector2.one;
            lr.offsetMin = Vector2.zero;
            lr.offsetMax = Vector2.zero;

            var panel = new GameObject("Panel");
            panel.transform.SetParent(_leaderboardRoot.transform, false);
            var pr = panel.AddComponent<RectTransform>();
            pr.anchorMin = new Vector2(0.5f, 0.5f);
            pr.anchorMax = new Vector2(0.5f, 0.5f);
            pr.sizeDelta = new Vector2(480, 360);
            var img = panel.AddComponent<Image>();
            img.color = new Color(0.06f, 0.07f, 0.1f, 0.98f);

            CreateText(panel.transform, "Top 10 (local)", 26, new Vector2(0, 130), TextAnchor.MiddleCenter);

            _leaderboardBody = CreateText(panel.transform, "Loading...", 18, new Vector2(0, -10), TextAnchor.UpperCenter);
            _leaderboardBody.GetComponent<RectTransform>().sizeDelta = new Vector2(440, 260);

            CreateButton(panel.transform, "Close", new Vector2(0, -140), () =>
            {
                _leaderboardRoot.SetActive(false);
            });

            _leaderboardRoot.SetActive(false);
        }

        void ToggleLeaderboard()
        {
            _leaderboardRoot.SetActive(true);
            if (_leaderboardBody == null)
                return;

            var lines = HighScoreStore.Load();
            if (lines.Count == 0)
            {
                _leaderboardBody.text = "No scores yet.";
                return;
            }

            var s = "";
            for (var i = 0; i < lines.Count; i++)
            {
                var e = lines[i];
                s += $"{i + 1}. {e.score} — {e.playerName}\n";
            }
            _leaderboardBody.text = s.TrimEnd();
        }

        static void EnsureEventSystem()
        {
            if (FindObjectOfType<UnityEngine.EventSystems.EventSystem>() != null)
                return;
            var esGo = new GameObject("EventSystem");
            esGo.AddComponent<UnityEngine.EventSystems.EventSystem>();
            esGo.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
        }

        static Text CreateText(Transform parent, string msg, int size, Vector2 pos, TextAnchor anchor)
        {
            var go = new GameObject("Text");
            go.transform.SetParent(parent, false);
            var t = go.AddComponent<Text>();
            t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            t.text = msg;
            t.fontSize = size;
            t.color = Color.white;
            t.alignment = anchor;
            var rt = go.GetComponent<RectTransform>();
            rt.anchorMin = new Vector2(0.5f, 0.5f);
            rt.anchorMax = new Vector2(0.5f, 0.5f);
            rt.pivot = new Vector2(0.5f, 0.5f);
            rt.anchoredPosition = pos;
            rt.sizeDelta = new Vector2(600, 120);
            return t;
        }

        static void CreateButton(Transform parent, string label, Vector2 pos, UnityEngine.Events.UnityAction onClick)
        {
            var go = new GameObject(label);
            go.transform.SetParent(parent, false);
            var rt = go.AddComponent<RectTransform>();
            rt.anchorMin = new Vector2(0.5f, 0.5f);
            rt.anchorMax = new Vector2(0.5f, 0.5f);
            rt.pivot = new Vector2(0.5f, 0.5f);
            rt.anchoredPosition = pos;
            rt.sizeDelta = new Vector2(220, 42);
            var img = go.AddComponent<Image>();
            img.color = new Color(0.2f, 0.55f, 0.35f, 1f);
            var btn = go.AddComponent<Button>();
            btn.onClick.AddListener(onClick);
            var txtGo = new GameObject("Label");
            txtGo.transform.SetParent(go.transform, false);
            var txt = txtGo.AddComponent<Text>();
            txt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            txt.text = label;
            txt.fontSize = 18;
            txt.color = Color.white;
            txt.alignment = TextAnchor.MiddleCenter;
            var trt = txtGo.GetComponent<RectTransform>();
            trt.anchorMin = Vector2.zero;
            trt.anchorMax = Vector2.one;
            trt.offsetMin = Vector2.zero;
            trt.offsetMax = Vector2.zero;
        }
    }
}
