import { ChevronDown, ChevronUp, Eye, EyeOff, RadioTower, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button, IconButton, SelectField, StatusPill, TextField } from "../../shared/ui";
import type { MqttConnectionConfig, MqttConnectionStatus, MqttPollingOption } from "../project";

type MqttBrokerFormProps = {
  config: MqttConnectionConfig;
  onChange: (config: MqttConnectionConfig) => void;
};

const pollingOptions: MqttPollingOption[] = [
  "50 ms",
  "100 ms",
  "200 ms",
  "300 ms",
  "500 ms",
  "1 sec",
  "1.5 sec",
  "2 sec",
  "3 sec",
  "5 sec",
  "30 sec",
  "1 min",
];

function getStatusLabel(status: MqttConnectionStatus) {
  if (status === "connected") {
    return "Connected";
  }

  if (status === "connecting") {
    return "Connecting";
  }

  if (status === "error") {
    return "Error";
  }

  return "Not Tested";
}

export function MqttBrokerForm({ config, onChange }: MqttBrokerFormProps) {
  const [securityOpen, setSecurityOpen] = useState(true);
  const [tlsOpen, setTlsOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [status, setStatus] = useState<MqttConnectionStatus>("idle");
  const [message, setMessage] = useState("Use ws:// or wss:// for browser test connection.");

  const updateConfig = (patch: Partial<MqttConnectionConfig>) => {
    onChange({ ...config, ...patch });
  };

  const handleTestConnection = () => {
    const address = config.address.trim();

    if (!config.name.trim()) {
      setStatus("error");
      setMessage("Name is required.");
      return;
    }

    if (!address) {
      setStatus("error");
      setMessage("Address is required.");
      return;
    }

    if (!config.clientId.trim()) {
      setStatus("error");
      setMessage("Client ID is required for Test Connection.");
      return;
    }

    if (address.startsWith("mqtt://")) {
      setStatus("error");
      setMessage("Browser cannot test mqtt:// directly in Version 07. Use ws:// or wss://.");
      return;
    }

    if (!address.startsWith("ws://") && !address.startsWith("wss://")) {
      setStatus("error");
      setMessage("Unsupported protocol. Test Connection supports ws:// or wss:// only.");
      return;
    }

    setStatus("connected");
    setMessage("Mock test passed. Real MQTT connection will be implemented in the MQTT service.");
  };

  const SecurityIcon = securityOpen ? ChevronUp : ChevronDown;
  const TlsIcon = tlsOpen ? ChevronUp : ChevronDown;
  const PasswordIcon = passwordVisible ? EyeOff : Eye;

  return (
    <section className="mqtt-form" aria-label="MQTT broker connecting form">
      <div className="mqtt-form-header">
        <div>
          <h3>MQTT Broker Connecting</h3>
          <p>Configure the browser WebSocket broker path for this project.</p>
        </div>
        <StatusPill tone={status === "error" ? "danger" : status === "connected" ? "online" : "info"}>
          {getStatusLabel(status)}
        </StatusPill>
      </div>

      <div className="mqtt-form-grid">
        <TextField
          label="Name"
          onChange={(event) => updateConfig({ name: event.target.value })}
          value={config.name}
        />
        <SelectField label="Type" value={config.type} disabled>
          <option value="MQTTclient">MQTTclient</option>
        </SelectField>
        <SelectField
          label="Polling"
          onChange={(event) => updateConfig({ polling: event.target.value as MqttPollingOption })}
          value={config.polling}
        >
          {pollingOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
        <label className="toggle-field">
          Enable
          <input
            checked={config.enabled}
            onChange={(event) => updateConfig({ enabled: event.target.checked })}
            type="checkbox"
          />
          <span aria-hidden="true" />
        </label>
      </div>

      <TextField
        label="Address (mqtt://[server]:[port])"
        onChange={(event) => updateConfig({ address: event.target.value })}
        value={config.address}
      />

      <section className="settings-accordion">
        <button
          aria-expanded={securityOpen}
          className="settings-accordion-trigger"
          onClick={() => setSecurityOpen((current) => !current)}
          type="button"
        >
          <span>Without Security and encryption mode</span>
          <SecurityIcon size={16} />
        </button>

        {securityOpen ? (
          <div className="settings-accordion-body">
            <TextField
              label="Client ID"
              onChange={(event) => updateConfig({ clientId: event.target.value })}
              value={config.clientId}
            />
            <TextField
              label="Username"
              onChange={(event) => updateConfig({ username: event.target.value })}
              value={config.username}
            />
            <label>
              Password
              <div className="password-field">
                <input
                  onChange={(event) => updateConfig({ password: event.target.value })}
                  type={passwordVisible ? "text" : "password"}
                  value={config.password}
                />
                <IconButton
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  onClick={() => setPasswordVisible((current) => !current)}
                >
                  <PasswordIcon size={16} />
                </IconButton>
              </div>
            </label>
          </div>
        ) : null}
      </section>

      <section className="settings-accordion">
        <button
          aria-expanded={tlsOpen}
          className="settings-accordion-trigger"
          onClick={() => setTlsOpen((current) => !current)}
          type="button"
        >
          <span>TLS Certificate</span>
          <TlsIcon size={16} />
        </button>

        {tlsOpen ? (
          <div className="settings-accordion-body">
            <label className="toggle-field">
              Enable TLS Certificate
              <input
                checked={config.tlsEnabled}
                onChange={(event) => updateConfig({ tlsEnabled: event.target.checked })}
                type="checkbox"
              />
              <span aria-hidden="true" />
            </label>
          </div>
        ) : null}
      </section>

      <div className={`mqtt-test-message mqtt-test-message-${status}`}>
        <RadioTower size={16} />
        <span>{message}</span>
      </div>

      <div className="mqtt-form-actions">
        <Button onClick={handleTestConnection}>
          <RotateCcw size={16} />
          Test Connection
        </Button>
      </div>
    </section>
  );
}
