import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.0.1/lit-element.js?module';

const TRANSLATIONS = {
  en: {
    line: 'Line',
    time: 'Time',
    destination: 'Destination',
    platform: 'Plat.',
    info: 'Info',
    last_updated: 'last updated',
    just_now: 'just now',
    min_ago: '{min} min ago',
    in: 'in',
    min: 'min',
    sec: 'sec',
  },
  it: {
    line: 'Linea',
    time: 'Ora',
    destination: 'Destinazione',
    platform: 'Bin.',
    info: 'Info',
    last_updated: 'ultimo aggiornamento',
    just_now: 'proprio ora',
    min_ago: '{min} min fa',
    in: 'tra',
    min: 'min',
    sec: 'sec',
  },
  fr: {
    line: 'Ligne',
    time: 'Heure',
    destination: 'Destination',
    platform: 'Voie',
    info: 'Remarque',
    last_updated: 'dernière mise à jour',
    just_now: "à l'instant",
    min_ago: 'il y a {min} min',
    in: 'dans',
    min: 'min',
    sec: 'sec',
  },
  de: {
    line: 'Linie',
    time: 'Zeit',
    destination: 'Nach',
    platform: 'Gleis',
    info: 'Hinweis',
    last_updated: 'Zuletzt aktualisiert',
    just_now: 'gerade eben',
    min_ago: 'vor {min} Min.',
    in: 'in',
    min: 'Min.',
    sec: 'Sek.',
  },
};

class SwissPublicTransportCard extends LitElement {
  static getConfigForm() {
    return {
      schema: [
        { name: 'title', required: true, selector: { text: {} } },
        {
          name: 'language',
          required: true,
          selector: {
            select: {
              options: [
                { value: 'en', label: 'English' },
                { value: 'de', label: 'Deutsch' },
                { value: 'fr', label: 'Français' },
                { value: 'it', label: 'Italiano' },
              ],
            },
          },
        },
        {
          name: 'devices',
          required: true,
          selector: {
            device: {
              multiple: true,
              filter: { integration: 'swiss_public_transport' },
            },
          },
        },
      ],
    };
  }

  static getStubConfig() {
    return {
      title: 'Departures',
      devices: [],
      language: 'en',
    };
  }
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      ha-card {
        background: #32347d;
        color: #fffffe;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        position: relative;
      }

      .logo {
        background: #fffffe
          url('https://brands.home-assistant.io/_/swiss_public_transport/logo.png') no-repeat left
          bottom / auto 95%;
        height: 18px;
        position: absolute;
        right: 14px;
        top: 14px;
        width: 158px;
      }

      .title {
        font-weight: bold;
        text-transform: uppercase;
        margin: 10px 14px 0;
      }

      .board {
        padding: 0 14px 14px;
      }

      table {
        border-collapse: collapse;
        font-weight: bold;
        width: 100%;
      }

      th {
        font-size: 0.8rem;
        font-weight: normal;
        padding: 12px 8px 4px;
        text-align: left;
        white-space: nowrap;
      }

      tr.clickable {
        cursor: pointer;
      }

      tr.clickable:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      td {
        border-top: 1px solid #fffffe;
        padding: 8px;
        vertical-align: middle;
        white-space: nowrap;
      }

      th:nth-child(3),
      td:nth-child(3) {
        max-width: 0;
        overflow: hidden;
        width: 100%;
      }

      th:nth-child(4),
      td:nth-child(4) {
        text-align: right;
      }

      th:last-child,
      td:last-child {
        padding-right: 0;
      }

      .delay {
        color: #ffcf41;
        font-size: 0.9em;
        padding-left: 5px;
        vertical-align: super;
      }

      .name {
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .details {
        font-size: 0.7rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .platform {
        font-size: 1.2rem;
        font-weight: bold;
      }

      .line {
        background: #fffffe;
        display: inline-block;
        font-size: 0.85rem;
        font-weight: bold;
        line-height: 1.1;
        min-width: 1.8em;
        padding: 1px 4px;
        text-align: center;
        vertical-align: middle;
        white-space: nowrap;
      }

      .B {
        color: black;
      }

      .R {
        border: black 1px solid;
        color: black;
      }

      .RE {
        border: #eb0000 1px solid;
        color: #eb0000;
      }

      .IC,
      .IR {
        background: #eb0000;
      }

      .info {
        font-size: 0.9rem;
      }

      .countdown-urgent {
        color: #ffcf41;
      }

      .refresh-button {
        background: none;
        border: none;
        color: #fffffe;
        cursor: pointer;
        padding: 0 5px;
        vertical-align: middle;
        opacity: 0.7;
      }
      .refresh-button:hover {
        opacity: 1;
      }
      .footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        font-size: 0.7rem;
        padding-top: 8px;
        opacity: 0.8;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._interval = setInterval(() => this.requestUpdate(), 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._interval);
  }

  _t(key, value) {
    const text = TRANSLATIONS[this.config.language]?.[key] || TRANSLATIONS.en[key] || key;
    return value !== undefined ? text.replace('{min}', value) : text;
  }

  update(changedProperties) {
    if (changedProperties.has('config') || (changedProperties.has('hass') && !this.hass.entities)) {
      this._entitiesIds = Object.entries(this.hass.entities)
        .filter(([_, entity]) => this.config.devices.includes(entity.device_id))
        .map(([entityId, _]) => entityId);

      this._entitiesByDevice = Object.entries(this.hass.entities)
        .filter(([entityId, _]) => this._entitiesIds.includes(entityId))
        .reduce((acc, [entityId, { device_id, translation_key }]) => {
          if (!acc[device_id]) {
            acc[device_id] = {
              entities: {},
              link: `https://www.sbb.ch/${this.config.language}?stops=${this.hass.devices[device_id].name.replace(' ', '~')}&moment=dep`,
              name: this.hass.devices[device_id].name.split(' ')[1],
            };
          }
          acc[device_id].entities[translation_key] = entityId;
          return acc;
        }, {});
    }

    if (changedProperties.has('hass')) {
      this._trips = Object.entries(this._entitiesByDevice)
        .flatMap(([_, { entities, link, name }]) => this._toTrip(entities, link, name))
        .sort((a, b) => a.time - b.time);

      const updateTimes = this._entitiesIds.map((entityId) =>
        new Date(this.hass.states[entityId].last_updated).getTime()
      );
      this._lastUpdated = Math.max(...updateTimes);
    }
    super.update(changedProperties);
  }

  _countdown(time) {
    const diffSec = Math.floor((time - Date.now()) / 1000);
    if (diffSec < 0) return '';
    if (diffSec <= 60)
      return html`<span class="countdown-urgent"
        >${this._t('in')} ${diffSec} ${this._t('sec')}</span
      >`;
    return html`<span>${this._t('in')} ${Math.floor(diffSec / 60)} ${this._t('min')}</span>`;
  }

  _toTrip(entities, link, name) {
    return [
      {
        delay:
          this.hass.states[entities.delay].state === 'unknown'
            ? ''
            : parseInt(this.hass.states[entities.delay].state),
        duration: (60 * parseFloat(this.hass.states[entities.trip_duration].state)).toFixed(0),
        line: this.hass.states[entities.line].state,
        lineType: this.hass.states[entities.line].state.replace(/[0-9]/g, ''),
        link,
        name,
        platform:
          this.hass.states[entities.platform].state === 'unknown'
            ? ''
            : this.hass.states[entities.platform].state,
        time: new Date(this.hass.states[entities.departure0].state),
        transfers: this.hass.states[entities.transfers].state,
      },
      {
        link,
        name,
        time: new Date(this.hass.states[entities.departure1].state),
      },
      { link, name, time: new Date(this.hass.states[entities.departure2].state) },
    ];
  }

  _handleRefresh() {
    this._entitiesIds.forEach((entityId) => {
      this.hass.callService('homeassistant', 'update_entity', {
        entity_id: entityId,
      });
    });
  }

  render() {
    const rows = this._trips.map((trip) => {
      return html`
        <tr class="clickable" @click="${() => window.open(trip.link, '_blank')}">
          <td>${trip.line ? html`<span class="line ${trip.lineType}">${trip.line}</span>` : ''}</td>
          <td>
            ${trip.time.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </td>
          <td>
            <div class="name">
              ${trip.name}${trip.delay ? html`<span class="delay">+${trip.delay}m</span>` : ''}
            </div>
            <div class="details">${trip.duration ? `${trip.duration} ${this._t('min')}` : ''}</div>
          </td>
          <td class="platform">${trip.platform}</td>
          <td class="info">${this._countdown(trip.time)}</td>
        </tr>
      `;
    });

    const diffMin = Math.floor((Date.now() - this._lastUpdated) / 60000);
    const lastUpdatedStr = diffMin === 0 ? this._t('just_now') : this._t('min_ago', diffMin);

    return html`
      <ha-card>
        <div class="logo"></div>
        <div class="title">${this.config.title}</div>
        <div class="board">
          <table>
            <thead>
              <tr>
                <th>${this._t('line')}</th>
                <th>${this._t('time')}</th>
                <th>${this._t('destination')}</th>
                <th>${this._t('platform')}</th>
                <th>${this._t('info')}</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="footer">
            <span>${this._t('last_updated')} ${lastUpdatedStr}</span>
            <button class="refresh-button" @click="${this._handleRefresh}">
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>
      </ha-card>
    `;
  }

  setConfig(config) {
    if (!config.devices) {
      throw new Error('Please define devices');
    }
    this.config = config;
  }
}

customElements.define('swiss-public-transport-card', SwissPublicTransportCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'swiss-public-transport-card',
  name: 'Swiss Public Transport',
  description: 'SBB-style board for the Swiss Public Transport integration',
  preview: true,
});

console.info('🇨🇭 Swiss Public Transport Card v1.0.0');
