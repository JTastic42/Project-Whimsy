using UnityEngine;

namespace CubeTetris.CameraControl
{
    public class OrbitCamera : MonoBehaviour
    {
        [SerializeField] Transform target;
        [SerializeField] float distance = 28f;
        [SerializeField] float rotateSpeed = 3f;
        [SerializeField] float minPitch = 10f;
        [SerializeField] float maxPitch = 89f;

        float _yaw;
        float _pitch = 35f;

        void Start()
        {
            if (target == null)
            {
                var go = new GameObject("CameraTarget");
                go.transform.position = new Vector3(7.5f, 7.5f, 7.5f);
                target = go.transform;
            }
        }

        void LateUpdate()
        {
            if (target == null)
                return;

            if (Input.GetMouseButton(0))
            {
                _yaw += Input.GetAxis("Mouse X") * rotateSpeed * 60f * Time.deltaTime;
                _pitch -= Input.GetAxis("Mouse Y") * rotateSpeed * 60f * Time.deltaTime;
                _pitch = Mathf.Clamp(_pitch, minPitch, maxPitch);
            }

            var rot = Quaternion.Euler(_pitch, _yaw, 0f);
            var back = rot * Vector3.back * distance;
            transform.position = target.position + back;
            transform.rotation = Quaternion.LookRotation(target.position - transform.position, Vector3.up);
        }
    }
}
